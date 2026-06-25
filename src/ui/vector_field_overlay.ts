import {Tool, ToolParameterMap} from "./tools.js";
import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import VectorField from "../models/vectorfield.js";
import {buildPreviewOperation} from "./preview_operation.js";
import {encodeOperations} from "../renderer/gpu/op_buffer.js";
import {supportsOffscreenCanvas} from "../renderer/worker/worker_curve_renderer.js";
import {MainToFieldWorkerMessage} from "./vector_field_worker_messages.js";

// Built as a classic (non-module) script by esbuild, matching how
// dist/index.js itself is loaded — see package.json's build/watch scripts.
const WORKER_URL = "/dist/ui/vector_field_worker.js";

interface FieldRenderer {
    setSize(width: number, height: number): void;
    toggleVisibility(): void;
    spacing: number;
    setOperation(op: Operation | null): void;
}

export default class VectorFieldOverlay {
    private renderer: FieldRenderer;
    private currentTool: Tool = Tool.Drop;
    private currentToolParameter: ToolParameterMap = {"radius": 50};
    private mouseDownCoord: Vec2 | null = null;
    private lastMouseCoord: Vec2 | null = null;

    constructor(container: HTMLElement) {
        this.renderer = supportsOffscreenCanvas()
            ? new WorkerFieldRenderer(container, WORKER_URL)
            : new MainThreadFieldRenderer(container);
        container.addEventListener("pointerdown", this.mouseDown.bind(this));
        container.addEventListener("pointerup", this.mouseUp.bind(this));
        container.addEventListener("pointercancel", this.mouseUp.bind(this));
        container.addEventListener("pointerout", this.mouseOut.bind(this));
        container.addEventListener("pointermove", this.mouseMove.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this) as EventListener);
    }

    private _previewOperation: Operation | null = null;

    set previewOperation(value: Operation | null) {
        this._previewOperation = value;
        this.renderer.setOperation(this._previewOperation);
    }

    setSize(width: number, height: number) {
        this.renderer.setSize(width, height);
    }

    toggleVisibility() {
        this.renderer.toggleVisibility();
    }

    increaseResolution() {
        this.renderer.spacing = Math.min(80, this.renderer.spacing + 2);
    }

    decreaseResolution() {
        this.renderer.spacing = Math.max(5, this.renderer.spacing - 2);
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameter = e.detail.parameters;
        this.generatePreviewOperation();
    }

    private mouseDown(e: PointerEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        switch (this.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
                this.lastMouseCoord = new Vec2(x, y);
        }
    }

    private mouseUp(e: PointerEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
    }

    private mouseOut(e: PointerEvent) {
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
        this.previewOperation = null;
    }

    private mouseMove(e: PointerEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = new Vec2(x, y);
        this.generatePreviewOperation();
    }

    private generatePreviewOperation() {
        this.previewOperation = buildPreviewOperation(this.currentTool, this.currentToolParameter, this.mouseDownCoord, this.lastMouseCoord);
    }
}

class MainThreadFieldRenderer implements FieldRenderer {
    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private visible: boolean = false;
    private frameRequested: boolean = false;
    private arrowWidth = 20;
    private arrowHeight = 12;
    private arrow = this.generateArrowPath();
    private cssWidth: number = 0;
    private cssHeight: number = 0;
    private dpr: number = 1;

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.className = "marbling-vector-field-overlay";
        this.overlayContext = this.overlayCanvas.getContext("2d")!;
        container.appendChild(this.overlayCanvas);
    }

    private _spacing: number = 40;

    get spacing(): number {
        return this._spacing;
    }

    set spacing(value: number) {
        this._spacing = value;
        this.scheduleDraw();
    }

    private _vectorField: VectorField | null = null;

    setOperation(op: Operation | null) {
        this._vectorField = op?.displacement ?? null;
        this.scheduleDraw();
    }

    generateArrowPath() {
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

    setSize(width: number, height: number) {
        this.dpr = window.devicePixelRatio || 1;
        this.cssWidth = width;
        this.cssHeight = height;
        this.overlayCanvas.width = Math.round(width * this.dpr);
        this.overlayCanvas.height = Math.round(height * this.dpr);
        this.overlayContext.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.scheduleDraw();
    }

    toggleVisibility() {
        if (this.visible) {
            this.visible = false;
            this.overlayCanvas.style.visibility = "hidden";
        } else {
            this.visible = true;
            this.overlayCanvas.style.visibility = "visible";
            this.scheduleDraw();
        }
    }

    private scheduleDraw() {
        if (!this.visible || this.frameRequested) {
            return;
        }
        this.frameRequested = true;
        requestAnimationFrame(() => {
            this.frameRequested = false;
            this.drawOverlay();
        });
    }

    private drawOverlay() {
        if (!this.visible) {
            return;
        }

        const ctx = this.overlayContext;
        const width = this.arrowWidth;
        const height = this.arrowHeight;
        ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
        if (this._vectorField == null) {
            return;
        }


        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const maxSize = 3;

        // Constant colors set once outside the loop; per-arrow opacity is
        // applied via globalAlpha (a numeric assignment) rather than by
        // building and parsing a new rgba() string every arrow.
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white";
        const strokeAlpha = 0.6;
        for (let x = 0; x < this.cssWidth; x += this._spacing) {
            for (let y = 0; y < this.cssHeight; y += this._spacing) {
                const dir = this._vectorField.atPoint(new Vec2(x, y));
                const angle = dir.angle();
                const rawSize = dir.length() / this.arrowHeight;
                const size = Math.min(rawSize, maxSize);
                if (size > 0.1) {
                    // Asymptotic rather than clipped, so arrows stay
                    // distinguishable even when displacement is many times
                    // larger than the visual size cap above (e.g. near the
                    // centre of a large-radius drop).
                    const intensity = rawSize / (rawSize + maxSize);

                    // Equivalent to save() + translate + scale + rotate +
                    // restore, but computed directly as one matrix so a
                    // single setTransform call replaces all five.
                    const cos = Math.cos(angle) * size * this.dpr;
                    const sin = Math.sin(angle) * size * this.dpr;
                    ctx.setTransform(cos, sin, -sin, cos, (x - halfWidth) * this.dpr, (y - halfHeight) * this.dpr);

                    ctx.globalAlpha = strokeAlpha;
                    ctx.stroke(this.arrow);
                    ctx.globalAlpha = 0.5 + 0.5 * intensity;
                    ctx.fill(this.arrow);
                }
            }
        }
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
}

// Off-main-thread twin of MainThreadFieldRenderer: owns a placeholder canvas
// whose rendering control is transferred to vector_field_worker.ts, so the
// per-arrow canvas calls don't compete with pointer-input handling on the
// main thread. RAF coalescing stays here (not duplicated in the worker) so
// the worker only ever draws once per request rather than scheduling its
// own frames.
class WorkerFieldRenderer implements FieldRenderer {
    private overlayCanvas: HTMLCanvasElement;
    private worker: Worker;
    private visible: boolean = false;
    private frameRequested: boolean = false;
    private cssWidth: number = 0;
    private cssHeight: number = 0;
    private _spacing: number = 40;

    constructor(container: HTMLElement, workerUrl: string) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.className = "marbling-vector-field-overlay";
        container.appendChild(this.overlayCanvas);

        this.worker = new Worker(workerUrl);
        const offscreen = this.overlayCanvas.transferControlToOffscreen();
        const dpr = window.devicePixelRatio || 1;
        this.post({type: "init", canvas: offscreen, width: this.overlayCanvas.width, height: this.overlayCanvas.height, dpr}, [offscreen]);
    }

    private post(message: MainToFieldWorkerMessage, transfer: Transferable[] = []) {
        this.worker.postMessage(message, transfer);
    }

    get spacing(): number {
        return this._spacing;
    }

    set spacing(value: number) {
        this._spacing = value;
        this.post({type: "spacing", value});
        this.scheduleDraw();
    }

    setOperation(op: Operation | null) {
        if (op == null) {
            this.post({type: "operation", data: null, count: 0});
        } else {
            const {data, count} = encodeOperations([op]);
            this.post({type: "operation", data, count}, [data.buffer]);
        }
        this.scheduleDraw();
    }

    setSize(width: number, height: number) {
        // overlayCanvas's width/height attributes can't be touched once
        // transferred to the worker (it throws); the worker resizes the
        // OffscreenCanvas it actually owns, and CSS keeps the placeholder's
        // layout size matching its container.
        this.cssWidth = width;
        this.cssHeight = height;
        this.post({type: "resize", width, height, dpr: window.devicePixelRatio || 1});
        this.scheduleDraw();
    }

    toggleVisibility() {
        if (this.visible) {
            this.visible = false;
            this.overlayCanvas.style.visibility = "hidden";
        } else {
            this.visible = true;
            this.overlayCanvas.style.visibility = "visible";
            this.scheduleDraw();
        }
    }

    private scheduleDraw() {
        if (!this.visible || this.frameRequested) {
            return;
        }
        this.frameRequested = true;
        requestAnimationFrame(() => {
            this.frameRequested = false;
            this.post({type: "draw"});
        });
    }
}
