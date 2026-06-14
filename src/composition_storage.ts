import Vec2 from "./models/vector.js";
import Color from "./models/color.js";
import Operation, {ChangeBaseColorOperation} from "./operations/color_operations.js";
import InkDropOperation from "./operations/inkdrop.js";
import LineTine from "./operations/linetine.js";
import CircularLineTine from "./operations/circularlinetine.js";
import WavyLineTine from "./operations/wavylinetine.js";
import Vortex from "./operations/vortex.js";

const STORAGE_KEY = "marblizer:draft:v1";
const VERSION = 1;

type Point = [number, number];

type SavedOperation =
    | { t: "drop"; p: Point; r: number; c: string; d: boolean }
    | { t: "line"; o: Point; v: Point; n: number; s: number }
    | { t: "wavy"; o: Point; v: Point; n: number; s: number }
    | { t: "circle"; o: Point; r: number; n: number; s: number; cc: boolean }
    | { t: "vortex"; o: Point; r: number; cc: boolean }
    | { t: "base"; c: string };

interface SavedComposition {
    version: number;
    canvas: Point;
    operations: SavedOperation[];
}

function point(vec: Vec2): Point {
    return [vec.x, vec.y];
}

function vec(point: Point): Vec2 {
    return new Vec2(point[0], point[1]);
}

function serializeOperation(operation: Operation): SavedOperation | null {
    if (operation instanceof InkDropOperation) {
        return {
            t: "drop",
            p: point(operation.position),
            r: operation.radius,
            c: operation.color.toHexString(),
            d: operation.displacing,
        };
    }

    if (operation instanceof LineTine) {
        return {
            t: "line",
            o: point(operation.origin),
            v: point(operation.line.scale((operation.alpha - 30.0) * 10.0)),
            n: operation.numTines,
            s: operation.spacing,
        };
    }

    if (operation instanceof WavyLineTine) {
        return {
            t: "wavy",
            o: point(operation.origin),
            v: point(operation.line.perp().scale(-1 * (operation.amplitude - 10.0) * 10.0)),
            n: operation.numTines,
            s: operation.spacing,
        };
    }

    if (operation instanceof CircularLineTine) {
        return {
            t: "circle",
            o: point(operation.center),
            r: operation.radius,
            n: operation.numTines,
            s: operation.interval,
            cc: operation.counterClockwise,
        };
    }

    if (operation instanceof Vortex) {
        return {
            t: "vortex",
            o: point(operation.center),
            r: operation.radius,
            cc: operation.counterclockwise,
        };
    }

    if (operation instanceof ChangeBaseColorOperation) {
        return {t: "base", c: operation.newBaseColor.toHexString()};
    }

    return null;
}

function reviveOperation(operation: SavedOperation): Operation | null {
    switch (operation.t) {
        case "drop": {
            const color = Color.withHex(operation.c);
            return color == null ? null : new InkDropOperation(vec(operation.p), operation.r, color, operation.d);
        }
        case "line":
            return new LineTine(vec(operation.o), vec(operation.v), operation.n, operation.s);
        case "wavy":
            return new WavyLineTine(vec(operation.o), vec(operation.v), operation.n, operation.s);
        case "circle":
            return new CircularLineTine(vec(operation.o), operation.r, operation.n, operation.s, operation.cc);
        case "vortex":
            return new Vortex(vec(operation.o), operation.r, operation.cc);
        case "base": {
            const color = Color.withHex(operation.c);
            return color == null ? null : new ChangeBaseColorOperation(color);
        }
    }
}

export function saveCompositionDraft(operations: Operation[], canvasSize: Vec2) {
    const serialized = operations.map(serializeOperation);
    if (serialized.some((operation) => operation == null)) {
        return;
    }

    const composition: SavedComposition = {
        version: VERSION,
        canvas: point(canvasSize),
        operations: <SavedOperation[]>serialized,
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(composition));
    } catch (e) {
        console.warn("Unable to save marbling draft.", e);
    }
}

export function loadCompositionDraft(): Operation[] | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        console.warn("Unable to load marbling draft.", e);
        return null;
    }

    if (raw == null) {
        return null;
    }

    try {
        const composition = <SavedComposition>JSON.parse(raw);
        if (composition.version !== VERSION || !Array.isArray(composition.operations)) {
            return null;
        }

        const operations = composition.operations.map(reviveOperation);
        if (operations.some((operation) => operation == null)) {
            return null;
        }
        return <Operation[]>operations;
    } catch (e) {
        console.warn("Unable to parse marbling draft.", e);
        return null;
    }
}

export function clearCompositionDraft() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn("Unable to clear marbling draft.", e);
    }
}
