import Operation from "../../operations/color_operations.js";
import InkDropOperation from "../../operations/inkdrop.js";
import Vortex from "../../operations/vortex.js";
import CircularLineTine from "../../operations/circularlinetine.js";
import LineTine from "../../operations/linetine.js";
import WavyLineTine from "../../operations/wavylinetine.js";
import Color from "../../models/color.js";
import Vec2 from "../../models/vector.js";

// Wire format shared by the WebGPU storage buffer and the CPU mirror in
// backmap.ts. Each operation occupies FLOATS_PER_OP floats, laid out as four
// vec4<f32> slots so it maps directly onto a WGSL struct of four vec4s:
//
//   meta  = [kind, flag, _, _]
//   p0    = [aX,   aY,   radius/lineX/normalX, alpha/lineY/normalY]
//   p1    = [lambda/numTines/angle, spacing/amplitude, alpha/wavelength, phase]
//   color = [r, g, b, a]            (0..1, deposits only)
//           or [reach, dragLength, _, _] for LineTine/WavyLine, which have no deposit
//
// The per-kind meaning of p0/p1/color is documented on each writer below and
// must stay in lock-step with the decoders in backmap.ts and marbling_shader.ts.
export const FLOATS_PER_OP = 16;

export enum OpKind {
    InkDrop = 0,
    Vortex = 1,
    CircularTine = 2,
    LineTine = 3,
    WavyLine = 4,
}

// Slot offsets within one operation's 16-float record.
export const META = 0;
export const P0 = 4;
export const P1 = 8;
export const COL = 12;

export interface EncodedOps {
    data: Float32Array;
    count: number;
}

// Encodes the geometric operations (those that displace the field and/or
// deposit ink) into a flat buffer. Pure base-colour operations carry no
// geometry and are resolved separately by resolveBaseColor; dropping them here
// does not change z-order, since base colour is always the bottom layer.
export function encodeOperations(operations: Operation[]): EncodedOps {
    const geometry = operations.filter(op => op.displacement != null || op.deposit != null);
    const data = new Float32Array(geometry.length * FLOATS_PER_OP);
    for (let i = 0; i < geometry.length; i++) {
        writeOp(data, i * FLOATS_PER_OP, geometry[i]);
    }
    return {data, count: geometry.length};
}

// The base colour the field sits on: the most recent change, or the fallback.
export function resolveBaseColor(operations: Operation[], fallback: Color): Color {
    let color = fallback;
    for (const op of operations) {
        if (op.newBaseColor != null) {
            color = op.newBaseColor;
        }
    }
    return color;
}

function writeOp(d: Float32Array, o: number, op: Operation) {
    if (op instanceof InkDropOperation) {
        // meta.flag = displacing; p0 = [centerX, centerY, radius, _]; deposit colour.
        d[o + META] = OpKind.InkDrop;
        d[o + META + 1] = op.displacing ? 1 : 0;
        d[o + P0] = op.position.x;
        d[o + P0 + 1] = op.position.y;
        d[o + P0 + 2] = op.radius;
        if (op.color != null) {
            d[o + COL] = op.color.r / 255;
            d[o + COL + 1] = op.color.g / 255;
            d[o + COL + 2] = op.color.b / 255;
            d[o + COL + 3] = 1;
        }
    } else if (op instanceof Vortex) {
        // meta.flag = counterclockwise; p0 = [cx, cy, radius, alpha]; p1.x = lambda.
        d[o + META] = OpKind.Vortex;
        d[o + META + 1] = op.counterclockwise ? 1 : 0;
        d[o + P0] = op.center.x;
        d[o + P0 + 1] = op.center.y;
        d[o + P0 + 2] = op.radius;
        d[o + P0 + 3] = op.alpha;
        d[o + P1] = op.lambda;
    } else if (op instanceof CircularLineTine) {
        // meta.flag = counterclockwise; p0 = [cx, cy, radius, alpha]; p1.x = lambda.
        d[o + META] = OpKind.CircularTine;
        d[o + META + 1] = op.counterClockwise ? 1 : 0;
        d[o + P0] = op.center.x;
        d[o + P0 + 1] = op.center.y;
        d[o + P0 + 2] = op.radius;
        d[o + P0 + 3] = op.alpha;
        d[o + P1] = op.lambda;
    } else if (op instanceof LineTine) {
        // p0 = [originX, originY, lineX, lineY]; p1 = [numTines, spacing, alpha, lambda];
        // color.x/.y = [reach, dragLength] (no deposit colour to store here).
        d[o + META] = OpKind.LineTine;
        d[o + P0] = op.origin.x;
        d[o + P0 + 1] = op.origin.y;
        d[o + P0 + 2] = op.line.x;
        d[o + P0 + 3] = op.line.y;
        d[o + P1] = op.numTines;
        d[o + P1 + 1] = op.spacing;
        d[o + P1 + 2] = op.alpha;
        d[o + P1 + 3] = op.lambda;
        d[o + COL] = op.reach;
        d[o + COL + 1] = op.dragLength;
    } else if (op instanceof WavyLineTine) {
        // p0 = [originX, originY, normalX, normalY]; p1 = [angle, amplitude, wavelength, phase];
        // color.x/.y = [reach, dragLength] (no deposit colour to store here).
        d[o + META] = OpKind.WavyLine;
        d[o + P0] = op.origin.x;
        d[o + P0 + 1] = op.origin.y;
        d[o + P0 + 2] = op.normal.x;
        d[o + P0 + 3] = op.normal.y;
        d[o + P1] = op.angle;
        d[o + P1 + 1] = op.amplitude;
        d[o + P1 + 2] = op.wavelength;
        d[o + P1 + 3] = op.phase;
        d[o + COL] = op.reach;
        d[o + COL + 1] = op.dragLength;
    }
}

// Reconstructs operation instances from the wire format above. Used at the
// boundary into a Worker, where postMessage's structured clone would
// otherwise strip an Operation's prototype (and so its atPoint method).
// Builds instances directly (bypassing each constructor's own derivation
// logic) since the encoding above stores already-derived fields like `line`
// or `normal` rather than raw constructor arguments.
export function decodeOperations(data: Float32Array, count: number): Operation[] {
    const operations: Operation[] = [];
    for (let i = 0; i < count; i++) {
        const o = i * FLOATS_PER_OP;
        operations.push(readOp(data, o));
    }
    return operations;
}

function readOp(d: Float32Array, o: number): Operation {
    switch (d[o + META]) {
        case OpKind.InkDrop: {
            const op = Object.create(InkDropOperation.prototype) as InkDropOperation;
            return Object.assign(op, {
                position: new Vec2(d[o + P0], d[o + P0 + 1]),
                radius: d[o + P0 + 2],
                color: new Color(
                    Math.round(d[o + COL] * 255),
                    Math.round(d[o + COL + 1] * 255),
                    Math.round(d[o + COL + 2] * 255),
                ),
                displacing: d[o + META + 1] === 1,
                newBaseColor: null,
            });
        }
        case OpKind.Vortex: {
            const op = Object.create(Vortex.prototype) as Vortex;
            return Object.assign(op, {
                center: new Vec2(d[o + P0], d[o + P0 + 1]),
                radius: d[o + P0 + 2],
                alpha: d[o + P0 + 3],
                lambda: d[o + P1],
                counterclockwise: d[o + META + 1] === 1,
                deposit: null,
                newBaseColor: null,
            });
        }
        case OpKind.CircularTine: {
            const op = Object.create(CircularLineTine.prototype) as CircularLineTine;
            return Object.assign(op, {
                center: new Vec2(d[o + P0], d[o + P0 + 1]),
                radius: d[o + P0 + 2],
                alpha: d[o + P0 + 3],
                lambda: d[o + P1],
                // Not encoded: atPoint (the only behaviour this op contributes
                // to the vector field) doesn't depend on numTines/interval.
                numTines: 0,
                interval: 0,
                counterClockwise: d[o + META + 1] === 1,
                deposit: null,
                newBaseColor: null,
            });
        }
        case OpKind.LineTine: {
            const op = Object.create(LineTine.prototype) as LineTine;
            const line = new Vec2(d[o + P0 + 2], d[o + P0 + 3]);
            return Object.assign(op, {
                origin: new Vec2(d[o + P0], d[o + P0 + 1]),
                line,
                normal: line.perp().norm(),
                numTines: d[o + P1],
                spacing: d[o + P1 + 1],
                alpha: d[o + P1 + 2],
                lambda: d[o + P1 + 3],
                reach: d[o + COL],
                dragLength: d[o + COL + 1],
                deposit: null,
                newBaseColor: null,
            });
        }
        case OpKind.WavyLine: {
            const op = Object.create(WavyLineTine.prototype) as WavyLineTine;
            return Object.assign(op, {
                origin: new Vec2(d[o + P0], d[o + P0 + 1]),
                normal: new Vec2(d[o + P0 + 2], d[o + P0 + 3]),
                angle: d[o + P1],
                amplitude: d[o + P1 + 1],
                wavelength: d[o + P1 + 2],
                phase: d[o + P1 + 3],
                reach: d[o + COL],
                dragLength: d[o + COL + 1],
                // Not encoded: atPoint's wave term depends only on angle/amplitude/
                // wavelength/phase; only the localization term needs origin/normal.
                line: Vec2.zero(),
                numTines: 0,
                spacing: 0,
                deposit: null,
                newBaseColor: null,
            });
        }
        default:
            throw new Error(`Unknown OpKind ${d[o + META]}`);
    }
}
