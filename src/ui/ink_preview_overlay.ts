import {Tool, ToolParameterMap} from "./tools.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import Operation, {InkDeposit} from "../operations/color_operations.js";
import ScatterOperation from "../operations/scatter.js";
import {CurveField} from "../renderer/curve_field.js";
import {buildPreviewOperation} from "./preview_operation.js";
import WebGPURenderer from "../renderer/gpu/webgpu_renderer.js";

// Live preview of what the in-progress drag/hover would commit, painted on
// top of the real canvas.
//
// For the vector backends: mirrors the committed CurveField, kept current
// via resync() whenever the composition's history changes (new op, undo,
// redo, reset, backend switch) -- not on every preview frame, so the
// O(history) cost of a full replay is paid only on commit, the same way the
// renderers' own undo/redo replay already does. Each preview frame just
// clones the already-current mirror and applies the one candidate operation
// to the clone, so its cost depends on the current drop/point count, not on
// how many operations led up to it.
//
// For the GPU backend: delegates straight to WebGPURenderer.previewOperations(),
// which keeps preview frames cheap via its own checkpoint mechanism (see
// webgpu_renderer.ts) rather than this class's CurveField mirror -- the GPU
// renderer has no equivalent lightweight committed-state mirror, so this
// overlay's own canvas mostly stays empty in that mode (set via setEnabled()).
//
// The exception is an in-progress scatter: its drops never displace and are
// always the newest ops, so compositing them in screen space over the GPU
// canvas is pixel-for-pixel equivalent to including them in the shader's
// backmap walk -- but O(new drops) per tick instead of O(all drops) per
// pixel. They're drawn incrementally onto this overlay's canvas (drops are
// append-only during a hold), and the GPU renderer isn't touched at all
// until the scatter commits.
export default class InkPreviewOverlay {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private mirrorField: CurveField = new CurveField();
    private gpuRenderer: WebGPURenderer | null = null;

    private currentTool: Tool = Tool.Drop;
    private currentToolParameters: ToolParameterMap = {"radius": 50};
    private mouseDownCoord: Vec2 | null = null;
    private lastMoveCoord: Vec2 | null = null;
    // true: draw vector preview on this overlay's own canvas (current backend
    // is a vector renderer). false: current backend is the GPU renderer,
    // which previews on its own canvas via previewOperations()/clearPreview().
    private enabled: boolean = true;
    private frameRequested: boolean = false;
    private cssWidth: number = 0;
    private cssHeight: number = 0;
    // In-progress scatter session, set by the UI while the scatter tool is held
    // down and cleared on commit or cancel.
    private scatterPreview: ScatterOperation | null = null;
    // Incremental-paint state for the GPU-mode scatter preview: which
    // session's drops array is on the canvas (the UI keeps one append-only
    // array per hold, so identity marks the session) and how many of its
    // drops are already painted, letting each frame draw just the new ones.
    private scatterDrawnDrops: readonly InkDeposit[] | null = null;
    private scatterDrawnCount = 0;

    constructor(container: HTMLElement, private getDropColor: () => Color) {
        this.canvas = document.createElement("canvas");
        this.canvas.className = "marbling-ink-preview-overlay";
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d")!;

        container.addEventListener("pointerdown", this.mouseDown.bind(this));
        container.addEventListener("pointerup", this.mouseUp.bind(this));
        container.addEventListener("pointercancel", this.mouseUp.bind(this));
        container.addEventListener("pointerout", this.mouseOut.bind(this));
        container.addEventListener("pointermove", this.mouseMove.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this) as EventListener);
    }

    setSize(width: number, height: number) {
        const dpr = window.devicePixelRatio || 1;
        this.cssWidth = width;
        this.cssHeight = height;
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Resizing wiped the backing store, so any incrementally drawn
        // scatter drops must be repainted from scratch.
        this.scatterDrawnCount = 0;
        this.scheduleDraw();
    }

    setGpuRenderer(renderer: WebGPURenderer | null) {
        this.gpuRenderer = renderer;
    }

    setScatterPreview(op: ScatterOperation | null) {
        this.scatterPreview = op;
        this.scheduleDraw();
    }

    // The canvas stays visible in both modes (GPU mode needs it for the
    // scatter preview); draw() clears it whenever it has nothing to show.
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.scheduleDraw();
    }

    resync(history: Operation[]) {
        if (this.enabled) {
            this.mirrorField.reset();
            this.mirrorField.applyOperations(history);
        }
        this.scheduleDraw();
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameters = e.detail.parameters;
        this.scheduleDraw();
    }

    private mouseDown(e: PointerEvent) {
        this.mouseDownCoord = new Vec2(e.offsetX, e.offsetY);
        this.scheduleDraw();
    }

    private mouseMove(e: PointerEvent) {
        this.lastMoveCoord = new Vec2(e.offsetX, e.offsetY);
        this.scheduleDraw();
    }

    private mouseUp(e: PointerEvent) {
        this.mouseDownCoord = null;
        this.scheduleDraw();
    }

    private mouseOut(e: PointerEvent) {
        this.mouseDownCoord = null;
        this.lastMoveCoord = null;
        this.scheduleDraw();
    }

    private scheduleDraw() {
        if (this.frameRequested) {
            return;
        }
        this.frameRequested = true;
        requestAnimationFrame(() => {
            this.frameRequested = false;
            this.draw();
        });
    }

    private draw() {
        if (!this.enabled) {
            this.drawGpuPreview();
            return;
        }
        this.scatterDrawnDrops = null;
        this.scatterDrawnCount = 0;
        this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
        if (this.scatterPreview != null && this.scatterPreview.drops.length > 0) {
            const preview = this.mirrorField.clone();
            preview.applyOperations([this.scatterPreview]);
            preview.renderTo(this.ctx, this.cssWidth, this.cssHeight);
            return;
        }
        const operation = buildPreviewOperation(this.currentTool, this.currentToolParameters, this.mouseDownCoord, this.lastMoveCoord, this.getDropColor());
        if (operation == null) {
            return;
        }
        const preview = this.mirrorField.clone();
        preview.applyOperations([operation]);
        preview.renderTo(this.ctx, this.cssWidth, this.cssHeight);
    }

    // GPU-mode preview. Single-op hover/drag previews go through the GPU
    // renderer's own bounded preview pass; an in-progress scatter is instead
    // painted here in screen space (see the class comment for why that's
    // equivalent), drawing only the drops added since the last frame so the
    // per-tick cost stays constant no matter how long the hold lasts.
    private drawGpuPreview() {
        const scatter = this.scatterPreview;
        if (scatter == null || scatter.drops.length === 0) {
            this.scatterDrawnDrops = null;
            this.scatterDrawnCount = 0;
            this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
            if (this.gpuRenderer == null) {
                return;
            }
            const operation = buildPreviewOperation(this.currentTool, this.currentToolParameters, this.mouseDownCoord, this.lastMoveCoord, this.getDropColor());
            if (operation == null) {
                this.gpuRenderer.clearPreview();
            } else {
                this.gpuRenderer.previewOperations([operation]);
            }
            return;
        }
        if (scatter.drops !== this.scatterDrawnDrops) {
            // A new session started before the previous one's clear was
            // drawn; start over rather than leaving stale drops behind.
            this.scatterDrawnDrops = scatter.drops;
            this.scatterDrawnCount = 0;
            this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
        }
        for (let i = this.scatterDrawnCount; i < scatter.drops.length; i++) {
            const drop = scatter.drops[i];
            this.ctx.fillStyle = drop.color.toRGBString();
            this.ctx.beginPath();
            this.ctx.arc(drop.center.x, drop.center.y, drop.radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        this.scatterDrawnCount = scatter.drops.length;
    }
}
