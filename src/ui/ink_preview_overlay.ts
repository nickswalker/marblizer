import {Tool, ToolParameterMap} from "./tools.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import Operation from "../operations/color_operations.js";
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
// overlay's own canvas just stays empty in that mode (set via setEnabled()).
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
        this.scheduleDraw();
    }

    setGpuRenderer(renderer: WebGPURenderer | null) {
        this.gpuRenderer = renderer;
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.canvas.style.visibility = enabled ? "visible" : "hidden";
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
        this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
        const operation = buildPreviewOperation(this.currentTool, this.currentToolParameters, this.mouseDownCoord, this.lastMoveCoord, this.getDropColor());
        if (!this.enabled) {
            if (this.gpuRenderer != null) {
                if (operation == null) {
                    this.gpuRenderer.clearPreview();
                } else {
                    this.gpuRenderer.previewOperations([operation]);
                }
            }
            return;
        }
        if (operation == null) {
            return;
        }
        const preview = this.mirrorField.clone();
        preview.applyOperations([operation]);
        preview.renderTo(this.ctx, this.cssWidth, this.cssHeight);
    }
}
