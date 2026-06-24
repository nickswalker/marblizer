import {CurveField} from "../curve_field.js";
import Color from "../../models/color.js";
import {decodeOperations} from "../gpu/op_buffer.js";
import {MainToWorkerMessage, WorkerToMainMessage} from "./curve_worker_messages.js";

const field = new CurveField();
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
// Logical (CSS-pixel) size; the backing OffscreenCanvas is sized to this
// times devicePixelRatio, with the context scaled to match, so drawing stays
// in the same coordinate space the operations were authored in.
let cssWidth = 0;
let cssHeight = 0;

function render() {
    if (ctx == null || canvas == null) {
        return;
    }
    field.renderTo(ctx as unknown as CanvasRenderingContext2D, cssWidth, cssHeight);
}

function resize(width: number, height: number, dpr: number) {
    if (canvas == null || ctx == null) {
        return;
    }
    cssWidth = width;
    cssHeight = height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function post(message: WorkerToMainMessage, transfer: Transferable[] = []) {
    (self as unknown as Worker).postMessage(message, transfer);
}

self.onmessage = (event: MessageEvent<MainToWorkerMessage>) => {
    const message = event.data;
    switch (message.type) {
        case "init":
            canvas = message.canvas;
            ctx = canvas.getContext("2d");
            resize(message.width, message.height, message.dpr);
            render();
            break;
        case "setSize":
            resize(message.width, message.height, message.dpr);
            render();
            break;
        case "applyOperations":
            field.applyOperations(decodeOperations(message.data, message.count));
            if (message.baseColor != null) {
                field.baseColor = new Color(message.baseColor.r, message.baseColor.g, message.baseColor.b);
            }
            render();
            break;
        case "reset":
            field.reset();
            render();
            break;
        case "save":
            canvas?.convertToBlob({type: "image/png"}).then((blob) => {
                post({type: "saved", requestId: message.requestId, blob});
            });
            break;
        case "getColorsAt": {
            const colors = message.points.map((point) => {
                if (ctx == null || canvas == null || point.x < 0 || point.y < 0 || point.x >= canvas.width || point.y >= canvas.height) {
                    return null;
                }
                const [r, g, b, a] = ctx.getImageData(point.x, point.y, 1, 1).data;
                return {r, g, b, a: a / 255};
            });
            post({type: "colorsAt", requestId: message.requestId, colors});
            break;
        }
    }
};
