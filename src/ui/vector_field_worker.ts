import Vec2 from "../models/vector.js";
import VectorField from "../models/vectorfield.js";
import {decodeOperations} from "../renderer/gpu/op_buffer.js";
import {MainToFieldWorkerMessage} from "./vector_field_worker_messages.js";

// Off-main-thread twin of the MainThreadFieldRenderer in
// vector_field_overlay.ts: same drawOverlay logic, just running against an
// OffscreenCanvas so the per-arrow canvas calls don't compete with input
// handling on the main thread. Kept in lock-step with that file by eye since
// there's only one of each shape (arrowWidth/arrowHeight/path) to keep in
// sync.
const arrowWidth = 20;
const arrowHeight = 12;
const arrow = generateArrowPath();

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let cssWidth = 0;
let cssHeight = 0;
let dpr = 1;
let spacing = 40;
let field: VectorField | null = null;

function generateArrowPath(): Path2D {
    const path = new Path2D();
    path.moveTo(0, 2);
    path.lineTo(2, 2);
    path.lineTo(12, 2);
    path.lineTo(12, 6);
    path.lineTo(20, 3);
    path.lineTo(12, 0);
    path.lineTo(12, 4);
    path.lineTo(0, 4);
    path.closePath();
    return path;
}

function resize(width: number, height: number, newDpr: number) {
    if (canvas == null || ctx == null) {
        return;
    }
    cssWidth = width;
    cssHeight = height;
    dpr = newDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
    if (ctx == null) {
        return;
    }

    const halfWidth = arrowWidth / 2;
    const halfHeight = arrowHeight / 2;
    const maxSize = 3;

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    if (field == null) {
        return;
    }

    ctx.fillStyle = "black";
    ctx.strokeStyle = "white";
    const strokeAlpha = 0.6;
    for (let x = 0; x < cssWidth; x += spacing) {
        for (let y = 0; y < cssHeight; y += spacing) {
            const dir = field.atPoint(new Vec2(x, y));
            const angle = dir.angle();
            const rawSize = dir.length() / arrowHeight;
            const size = Math.min(rawSize, maxSize);
            if (size > 0.1) {
                const intensity = rawSize / (rawSize + maxSize);

                const cos = Math.cos(angle) * size * dpr;
                const sin = Math.sin(angle) * size * dpr;
                ctx.setTransform(cos, sin, -sin, cos, (x - halfWidth) * dpr, (y - halfHeight) * dpr);

                ctx.globalAlpha = strokeAlpha;
                ctx.stroke(arrow);
                ctx.globalAlpha = 0.5 + 0.5 * intensity;
                ctx.fill(arrow);
            }
        }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

self.onmessage = (event: MessageEvent<MainToFieldWorkerMessage>) => {
    const message = event.data;
    switch (message.type) {
        case "init":
            canvas = message.canvas;
            ctx = canvas.getContext("2d");
            resize(message.width, message.height, message.dpr);
            break;
        case "resize":
            resize(message.width, message.height, message.dpr);
            break;
        case "spacing":
            spacing = message.value;
            break;
        case "operation":
            field = message.data == null ? null : decodeOperations(message.data, message.count)[0]?.displacement ?? null;
            break;
        case "draw":
            draw();
            break;
    }
};
