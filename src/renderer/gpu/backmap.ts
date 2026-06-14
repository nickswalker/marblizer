import {COL, FLOATS_PER_OP, META, OpKind, P0, P1} from "./op_buffer.js";

// CPU mirror of the WGSL fragment shader in marbling_shader.ts. Both walk the
// encoded operation list newest-first, undoing each displacement so a final
// pixel is traced back to "time zero", where the deposited ink discs are still
// perfect circles. The first (newest) disc that contains the back-mapped point
// wins, since later deposits paint over earlier ones. If none do, the pixel is
// the base colour.
//
// This file exists to validate the algorithm and the buffer layout headlessly
// (see the comparison test); the WGSL is a line-for-line port of it. Keep the
// two in sync.

// Returns linear 0..255 RGB.
export function colorAt(
    px: number,
    py: number,
    data: Float32Array,
    count: number,
    base: [number, number, number],
): [number, number, number] {
    let x = px;
    let y = py;

    for (let i = count - 1; i >= 0; i--) {
        const o = i * FLOATS_PER_OP;
        const kind = data[o + META];

        if (kind === OpKind.InkDrop) {
            const cx = data[o + P0];
            const cy = data[o + P0 + 1];
            const radius = data[o + P0 + 2];
            const dx = x - cx;
            const dy = y - cy;
            const dist2 = dx * dx + dy * dy;
            // Deposited disc: tested in this op's post-deposit frame, before
            // undoing this op's own displacement.
            if (dist2 <= radius * radius) {
                return [data[o + COL] * 255, data[o + COL + 1] * 255, data[o + COL + 2] * 255];
            }
            // Inverse radial spread (only if this drop displaced): r = sqrt(r'^2 - R^2).
            if (data[o + META + 1] > 0.5) {
                const rPrime = Math.sqrt(dist2);
                const r = Math.sqrt(Math.max(0, dist2 - radius * radius));
                const f = r / rPrime;
                x = cx + dx * f;
                y = cy + dy * f;
            }
        } else if (kind === OpKind.Vortex) {
            [x, y] = rotateInverse(x, y, data, o, false);
        } else if (kind === OpKind.CircularTine) {
            [x, y] = rotateInverse(x, y, data, o, true);
        } else if (kind === OpKind.LineTine) {
            const off = lineTineOffset(x, y, data, o);
            x -= off[0];
            y -= off[1];
        } else if (kind === OpKind.WavyLine) {
            const off = wavyOffset(x, y, data, o);
            x -= off[0];
            y -= off[1];
        }
    }

    return base;
}

// Inverse of the rotation field shared by Vortex (isCircular=false) and
// CircularLineTine (isCircular=true). Rotation preserves distance to the
// centre, so the inverse is a rotation by the negated angle at the same radius.
function rotateInverse(
    x: number,
    y: number,
    data: Float32Array,
    o: number,
    isCircular: boolean,
): [number, number] {
    const cx = data[o + P0];
    const cy = data[o + P0 + 1];
    const radius = data[o + P0 + 2];
    const alpha = data[o + P0 + 3];
    const lambda = data[o + P1];
    const counterclockwise = data[o + META + 1] > 0.5;

    const px = x - cx;
    const py = y - cy;
    const len = Math.sqrt(px * px + py * py);
    // The centre is a fixed point of the rotation; guarding it also avoids the
    // l/len singularity (the field is undefined exactly at the centre).
    if (len < 1e-6) {
        return [x, y];
    }
    const d = isCircular ? Math.abs(len - radius) : Math.abs(100 / radius * len);
    const l = alpha * lambda / (d + lambda);
    let theta = counterclockwise ? -l / len : l / len;
    theta = -theta; // inverse

    const cs = Math.cos(theta);
    const sn = Math.sin(theta);
    // Matches Vec2.mult(Mat2x2(cos, sin, -sin, cos)): (x cosθ − y sinθ, x sinθ + y cosθ).
    const rx = px * cs - py * sn;
    const ry = px * sn + py * cs;
    return [cx + rx, cy + ry];
}

// Forward displacement of LineTine; its inverse is the negation of this.
function lineTineOffset(x: number, y: number, data: Float32Array, o: number): [number, number] {
    const ox = data[o + P0];
    const oy = data[o + P0 + 1];
    const lineX = data[o + P0 + 2];
    const lineY = data[o + P0 + 3];
    const numTines = data[o + P1];
    const spacing = data[o + P1 + 1];
    const alpha = data[o + P1 + 2];
    const lambda = data[o + P1 + 3];

    // normal = perp(line), with line already unit length.
    const nx = -lineY;
    const ny = lineX;
    let dPerp = Math.abs((x - ox) * nx + (y - oy) * ny);
    const halfSpace = spacing / 2;
    if (dPerp / spacing < numTines) {
        const test = dPerp - Math.floor(dPerp / spacing) * spacing;
        dPerp = halfSpace - Math.abs(test - halfSpace);
    } else {
        dPerp = dPerp - spacing * numTines;
    }
    const factor = alpha * lambda / (dPerp + lambda);
    return [lineX * factor, lineY * factor];
}

// Forward displacement of WavyLineTine; its inverse is the negation of this.
function wavyOffset(x: number, y: number, data: Float32Array, o: number): [number, number] {
    const angle = data[o + P1];
    const amplitude = data[o + P1 + 1];
    const wavelength = data[o + P1 + 2];
    const phase = data[o + P1 + 3];

    const sinT = Math.sin(angle);
    const cosT = Math.cos(angle);
    const v = x * sinT - y * cosT;
    const factor = amplitude * Math.sin(2 * Math.PI / wavelength * v + phase);
    return [cosT * factor, sinT * factor];
}
