import {Tool, ToolParameterMap} from "./tools.js";
import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import VectorField from "../models/vectorfield.js";
import {buildPreviewOperation} from "./preview_operation.js";

export default class VectorFieldOverlay {
    private renderer: VectorFieldRenderer;
    private currentTool: Tool = Tool.Drop;
    private currentToolParameter: ToolParameterMap = {"radius": 50};
    private mouseDownCoord: Vec2 | null = null;
    private lastMouseCoord: Vec2 | null = null;

    constructor(container: HTMLElement) {
        this.renderer = new VectorFieldRenderer(container);
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
        this.renderer.vectorField = this._previewOperation?.displacement ?? null;
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

class VectorFieldRenderer {
    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private visible: boolean = false;
    private frameRequested: boolean = false;
    private arrowWidth = 20;
    private arrowHeight = 12;
    private arrow = this.generateArrowPath();
    private cssWidth: number = 0;
    private cssHeight: number = 0;

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

    set vectorField(value: VectorField | null) {
        this._vectorField = value;
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
        const dpr = window.devicePixelRatio || 1;
        this.cssWidth = width;
        this.cssHeight = height;
        this.overlayCanvas.width = Math.round(width * dpr);
        this.overlayCanvas.height = Math.round(height * dpr);
        this.overlayContext.setTransform(dpr, 0, 0, dpr, 0, 0);
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

        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        for (let x = 0; x < this.cssWidth; x += this._spacing) {
            for (let y = 0; y < this.cssHeight; y += this._spacing) {
                const dir = this._vectorField.atPoint(new Vec2(x, y));
                const angle = dir.angle();
                const rawSize = dir.length() / this.arrowHeight;
                const size = Math.min(rawSize, maxSize);
                if (size > 0.1) {
                    const intensity = Math.min(rawSize / maxSize, 1);
                    ctx.fillStyle = `rgba(0,0,0,${(0.5 + 0.5 * intensity).toFixed(3)})`;

                    ctx.save();
                    ctx.translate(x - halfWidth, y - halfHeight);
                    ctx.scale(size, size);
                    ctx.rotate(angle);

                    ctx.stroke(this.arrow);
                    ctx.fill(this.arrow);
                    ctx.restore();
                }
            }
        }
    }
}
