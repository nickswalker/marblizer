import {CurveField} from "../curve_field.js";
import Color from "../../models/color.js";
import {decodeOperations} from "../gpu/op_buffer.js";
import {MainToWorkerMessage, WorkerToMainMessage} from "./curve_worker_messages.js";

const field = new CurveField();
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

function render() {
    if (ctx == null || canvas == null) {
        return;
    }
    field.renderTo(ctx as unknown as CanvasRenderingContext2D, canvas.width, canvas.height);
}

function post(message: WorkerToMainMessage, transfer: Transferable[] = []) {
    (self as unknown as Worker).postMessage(message, transfer);
}

self.onmessage = (event: MessageEvent<MainToWorkerMessage>) => {
    const message = event.data;
    switch (message.type) {
        case "init":
            canvas = message.canvas;
            canvas.width = message.width;
            canvas.height = message.height;
            ctx = canvas.getContext("2d");
            render();
            break;
        case "setSize":
            if (canvas != null) {
                canvas.width = message.width;
                canvas.height = message.height;
                render();
            }
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
