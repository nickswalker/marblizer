import MarblingRenderer from "../curve_renderer.js";
import Operation from "../../operations/color_operations.js";
import Color from "../../models/color.js";
import Vec2 from "../../models/vector.js";
import {encodeOperations} from "../gpu/op_buffer.js";
import {MainToWorkerMessage, WorkerToMainMessage} from "./curve_worker_messages.js";

// Returns true if the browser can transfer a canvas's rendering control to a
// worker, which is what lets the vector renderer's displacement math and
// Path2D tessellation run off the main thread.
export function supportsOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== "undefined"
        && typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function";
}

// Main-thread proxy for the vector renderer: owns the visible canvas and a
// dedicated worker that does the actual simulation and drawing (see
// curve_worker.ts and curve_field.ts, which hold the DOM-free simulation
// logic shared by this and the synchronous InteractiveCurveRenderer
// fallback). Operations cross the worker boundary pre-encoded as in
// op_buffer.ts, since live Operation instances can't survive postMessage.
export default class WorkerCurveRenderer implements MarblingRenderer {
    readonly displayCanvas: HTMLCanvasElement;
    private readonly worker: Worker;
    private history: Operation[] = [];
    private nextRequestId = 0;
    private readonly pendingSaves = new Map<number, (blob: Blob) => void>();
    private readonly pendingColorQueries = new Map<number, (colors: (Color | null)[]) => void>();
    // Logical (CSS-pixel) size, used to scale getColorsAt queries to the
    // device-pixel backing store the worker actually owns.
    private cssWidth: number = 0;
    private cssHeight: number = 0;

    constructor(container: HTMLElement, workerUrl: string) {
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        container.insertBefore(this.displayCanvas, container.firstChild);

        // Built as a classic (non-module) script by esbuild, matching how
        // dist/index.js itself is loaded — see package.json's build/watch
        // scripts and index.html.
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = this.onMessage.bind(this);

        const offscreen = this.displayCanvas.transferControlToOffscreen();
        this.post({type: "init", canvas: offscreen, width: this.displayCanvas.width, height: this.displayCanvas.height, dpr: window.devicePixelRatio || 1}, [offscreen]);
    }

    private post(message: MainToWorkerMessage, transfer: Transferable[] = []) {
        this.worker.postMessage(message, transfer);
    }

    private onMessage(event: MessageEvent<WorkerToMainMessage>) {
        const message = event.data;
        if (message.type === "saved") {
            this.pendingSaves.get(message.requestId)?.(message.blob);
            this.pendingSaves.delete(message.requestId);
        } else if (message.type === "colorsAt") {
            const colors = message.colors.map((c) => c == null ? null : new Color(c.r, c.g, c.b, c.a ?? 1));
            this.pendingColorQueries.get(message.requestId)?.(colors);
            this.pendingColorQueries.delete(message.requestId);
        }
    }

    setSize(width: number, height: number) {
        // displayCanvas's width/height attributes can't be touched once
        // transferred to the worker (it throws); the worker resizes the
        // OffscreenCanvas it actually owns, and CSS (`canvas { width/height:
        // 100% }`) keeps the placeholder's layout size matching its container.
        this.cssWidth = width;
        this.cssHeight = height;
        this.post({type: "setSize", width, height, dpr: window.devicePixelRatio || 1});
    }

    reset() {
        this.history = [];
        this.post({type: "reset"});
    }

    getHistory(): Operation[] {
        return this.history;
    }

    applyOperations(operations: Operation[]) {
        for (let i = 0; i < operations.length; i++) {
            this.history.push(operations[i]);
        }
        const baseColorOp = operations.filter(op => op.newBaseColor != null).pop();
        const baseColor = baseColorOp?.newBaseColor ?? null;
        const {data, count} = encodeOperations(operations);
        this.post({type: "applyOperations", data, count, baseColor}, [data.buffer]);
    }

    getColorsAt(points: Vec2[]): Promise<(Color | null)[]> {
        const requestId = this.nextRequestId++;
        const done = new Promise<(Color | null)[]>((resolve) => this.pendingColorQueries.set(requestId, resolve));
        const dpr = window.devicePixelRatio || 1;
        const scaled = points.map((p) => {
            if (p.x < 0 || p.y < 0 || p.x >= this.cssWidth || p.y >= this.cssHeight) {
                return {x: -1, y: -1};
            }
            return {x: Math.round(p.x * dpr), y: Math.round(p.y * dpr)};
        });
        this.post({type: "getColorsAt", requestId, points: scaled});
        return done;
    }

    save() {
        const requestId = this.nextRequestId++;
        const done = new Promise<Blob>((resolve) => this.pendingSaves.set(requestId, resolve));
        this.post({type: "save", requestId});
        done.then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "ink-marbling-image.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }
}
