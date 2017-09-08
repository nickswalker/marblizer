///<reference path="../panes/scriptingpane.ts"/>
///<reference path="cursor_renderer.ts"/>
///<reference path="tine_renderer.ts"/>
///<reference path="dynamic_radius_renderer.ts"/>


class CursorOverlay {

    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private currentCursorRenderer: CursorRenderer;

    private lastMoveCoord: Vec2 = null;
    private mouseDownCoord: Vec2 = null;

    private prevDrawOrigin: Vec2 = new Vec2(-1, -1);
    private prevDrawSize: Vec2 = new Vec2(-1, -1);

    private currentTool: Tool = Tool.Drop;
    private currentToolParameters: Object = {"radius": 50};

    private rendererForTool: { [key: number]: CursorRenderer };
    private defaultRenderer: CrossRenderer;

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayContext = this.overlayCanvas.getContext("2d");
        this.overlayCanvas.className = "marbling-cursor-overlay";
        container.appendChild(this.overlayCanvas);


        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        document.addEventListener("mouseout", this.mouseOut.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this));

        const circle = new CircleRenderer();
        const tine = new TineRenderer();
        const wavy = new TineRenderer(function (t) {
            return 100 * Math.sin(.013 * t)
        });
        const dynamicRadius = new DynamicRadiusRenderer();
        this.defaultRenderer = new CrossRenderer();

        this.rendererForTool = {};
        this.rendererForTool[Tool.Drop] = circle;
        this.rendererForTool[Tool.Spatter] = circle;
        this.rendererForTool[Tool.TineLine] = tine;
        this.rendererForTool[Tool.WavyLine] = wavy;
        this.rendererForTool[Tool.CircularTine] = dynamicRadius;
        this.rendererForTool[Tool.Vortex] = dynamicRadius;
        this.currentCursorRenderer = this.rendererForTool[this.currentTool];
        this.drawOverlay();

    }

    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
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
                this.currentCursorRenderer['radius'] = this.currentToolParameters["radius"];
                break;
            case Tool.Spatter:
                this.currentCursorRenderer['radius'] = this.currentToolParameters["scatterRadius"];
                break;
            case Tool.TineLine:
            case Tool.WavyLine:
                this.currentCursorRenderer['numTines'] = this.currentToolParameters["numTines"];
                this.currentCursorRenderer['spacing'] = this.currentToolParameters["spacing"];
                break;
        }

    }

    private mouseDown(e: MouseEvent) {
        this.mouseDownCoord = new Vec2(e.offsetX, e.offsetY);
    }

    private mouseMove(e: MouseEvent) {
        this.lastMoveCoord = new Vec2(e.offsetX, e.offsetY);
    }

    private mouseUp(e: MouseEvent) {
        this.mouseDownCoord = null;
    }

    private mouseOut(e: MouseEvent) {
        this.lastMoveCoord = null;
        this.mouseDownCoord = null;
    }

    private drawOverlay() {
        const ctx = this.overlayContext;
        ctx.clearRect(this.prevDrawOrigin.x, this.prevDrawOrigin.y, this.prevDrawSize.x, this.prevDrawSize.y);

        if (this.lastMoveCoord == null) {
            requestAnimationFrame(this.drawOverlay.bind(this));
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

        requestAnimationFrame(this.drawOverlay.bind(this));
    }


}