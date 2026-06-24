import Vec2 from "../../models/vector.js";
import CursorRenderer, {CircleRenderer, CrossRenderer} from "./cursor_renderer.js";
import {Tool, ToolParameterMap} from "../tools.js";
import TineRenderer from "./tine_renderer.js";
import SpinRenderer from "./spin_renderer.js";

export default class CursorOverlay {

    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private currentCursorRenderer: CursorRenderer;

    private lastMoveCoord: Vec2 | null = null;
    private mouseDownCoord: Vec2 | null = null;

    private prevDrawOrigin: Vec2 = new Vec2(-1, -1);
    private prevDrawSize: Vec2 = new Vec2(-1, -1);

    private currentTool: Tool = Tool.Drop;
    private currentToolParameters: ToolParameterMap = {"radius": 50};

    private rendererForTool: { [key: number]: CursorRenderer };
    private defaultRenderer: CrossRenderer;

    private frameRequested: boolean = false;

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayContext = this.overlayCanvas.getContext("2d")!;
        this.overlayCanvas.className = "marbling-cursor-overlay";
        container.appendChild(this.overlayCanvas);


        container.addEventListener("pointermove", this.mouseMove.bind(this));
        container.addEventListener("pointerdown", this.mouseDown.bind(this));
        container.addEventListener("pointerup", this.mouseUp.bind(this));
        container.addEventListener("pointercancel", this.mouseUp.bind(this));
        document.addEventListener("pointerout", this.mouseOut.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this) as EventListener);

        const circle = new CircleRenderer();
        const tine = new TineRenderer();
        const wavy = new TineRenderer(function (t: number) {
            return 100 * Math.sin(.013 * t)
        });
        const spin = new SpinRenderer();
        this.defaultRenderer = new CrossRenderer();

        this.rendererForTool = {};
        this.rendererForTool[Tool.Drop] = circle;
        this.rendererForTool[Tool.Spatter] = circle;
        this.rendererForTool[Tool.TineLine] = tine;
        this.rendererForTool[Tool.WavyLine] = wavy;
        this.rendererForTool[Tool.CircularTine] = spin;
        this.rendererForTool[Tool.Vortex] = spin;
        this.currentCursorRenderer = this.rendererForTool[this.currentTool];

    }

    private scheduleDraw() {
        if (this.frameRequested) {
            return;
        }
        this.frameRequested = true;
        requestAnimationFrame(() => {
            this.frameRequested = false;
            this.drawOverlay();
        });
    }

    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
        this.scheduleDraw();
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameters = e.detail.parameters;
        this.currentCursorRenderer = this.rendererForTool[this.currentTool];
        if (this.currentCursorRenderer == null) {
            this.currentCursorRenderer = this.defaultRenderer;
        }
        switch (this.currentTool) {
            case Tool.Drop:
                this.currentCursorRenderer.radius = this.currentToolParameters["radius"];
                break;
            case Tool.Spatter:
                this.currentCursorRenderer.radius = this.currentToolParameters["scatterRadius"];
                break;
            case Tool.TineLine:
            case Tool.WavyLine:
                this.currentCursorRenderer.numTines = this.currentToolParameters["numTines"];
                this.currentCursorRenderer.spacing = this.currentToolParameters["spacing"];
                break;
        }
        this.scheduleDraw();

    }

    private mouseDown(e: PointerEvent) {
        this.mouseDownCoord = new Vec2(e.offsetX, e.offsetY);
        // No hover precedes a touch tap, so lastMoveCoord would otherwise
        // still be null here and drawOverlay() would skip the preview.
        this.lastMoveCoord = this.mouseDownCoord;
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
        this.lastMoveCoord = null;
        this.mouseDownCoord = null;
        this.scheduleDraw();
    }

    private drawOverlay() {
        const ctx = this.overlayContext;
        ctx.clearRect(this.prevDrawOrigin.x, this.prevDrawOrigin.y, this.prevDrawSize.x, this.prevDrawSize.y);

        if (this.lastMoveCoord == null) {
            return;
        }


        let minExtent: Vec2;
        let drawSize: Vec2;
        if (this.mouseDownCoord == null) {
            [minExtent, drawSize] = this.currentCursorRenderer.drawAtRest(ctx, this.lastMoveCoord);
        } else {
            [minExtent, drawSize] = this.currentCursorRenderer.drawActive(ctx, this.mouseDownCoord, this.lastMoveCoord);
        }

        this.prevDrawSize = drawSize;
        this.prevDrawOrigin = minExtent;
        //  highlight region that was drawn over
        //ctx.fillRect(this.prevDrawOrigin.x, this.prevDrawOrigin.y, this.prevDrawSize.x, this.prevDrawSize.y);
    }


}
