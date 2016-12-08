///<reference path="panes/textinputpane.ts"/>


class CursorOverlay {

    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private cursorCanvas: HTMLCanvasElement;

    private lastMoveCoord: Vec2 = null;
    private mouseDownCoord: Vec2 = null;

    private prevDrawOrigin: Vec2 = new Vec2(-1, -1);
    private prevDrawSize: Vec2 = new Vec2(-1, -1);

    private currentTool: Tool = Tool.Drop;
    private currentToolParameters: Object = {"radius": 50};

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayContext = this.overlayCanvas.getContext("2d");
        this.overlayCanvas.className = "marbling-cursor-overlay";
        container.appendChild(this.overlayCanvas);

        this.cursorCanvas = document.createElement("canvas");
        this.cursorCanvas.style.visibility = "hidden";
        this.cursorCanvas.width = 200;
        this.cursorCanvas.height = 200;

        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        document.addEventListener("mouseout", this.mouseOut.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this));

        this.drawCursor();
        this.drawOverlay();

    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameters = e.detail.parameters;
        this.drawCursor();
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
    }

    private drawOverlay() {
        const ctx = this.overlayContext;
        ctx.clearRect(this.prevDrawOrigin.x, this.prevDrawOrigin.y, this.prevDrawSize.x, this.prevDrawSize.y);

        if (this.lastMoveCoord == null) {
            requestAnimationFrame(this.drawOverlay.bind(this));
            return;
        }
        const newX = this.lastMoveCoord.x - (this.cursorCanvas.width / 2);
        const newY = this.lastMoveCoord.y - (this.cursorCanvas.height / 2);
        ctx.drawImage(this.cursorCanvas, newX, newY);
        let minExtent = new Vec2(newX, newY);
        let maxExtent = minExtent.add(new Vec2(200, 200));
        ctx.strokeStyle = "rgba(100,100,100, 0.1)";

        switch (this.currentTool) {
            case Tool.TineLine:
                if (this.mouseDownCoord != null) {
                    ctx.beginPath();
                    ctx.moveTo(this.lastMoveCoord.x, this.lastMoveCoord.y);
                    ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                    ctx.closePath();
                    ctx.stroke();
                    const minPoint = vecMin(this.lastMoveCoord, this.mouseDownCoord);
                    const maxPoint = vecMax(this.lastMoveCoord, this.mouseDownCoord);


                    maxExtent = vecMax(maxExtent, maxPoint);
                    minExtent = vecMin(minExtent, minPoint);

                    ctx.fillStyle = "rgba(100,100,100, 0.4)";
                    const spacing = this.currentToolParameters.spacing;
                    const numTines = this.currentToolParameters.numTines;
                    const dir = this.lastMoveCoord.sub(this.mouseDownCoord).norm().perp();
                    for (let i = 0; i <= numTines; i++) {
                        const tineOrigin = this.mouseDownCoord.add(dir.copy().scale(i * spacing));
                        circle(ctx, tineOrigin);
                        const secondOrigin = this.mouseDownCoord.add(dir.copy().scale(-i * spacing));
                        circle(ctx, secondOrigin);

                        maxExtent = vecMax(maxExtent, tineOrigin);
                        maxExtent = vecMax(maxExtent, secondOrigin);
                        minExtent = vecMin(minExtent, tineOrigin);
                        minExtent = vecMin(minExtent, secondOrigin);
                    }
                    // Wiggle room to account for stroke width
                    minExtent = minExtent.sub(new Vec2(5, 5));
                    maxExtent = maxExtent.add(new Vec2(5, 5));


                }
        }

        this.prevDrawSize = maxExtent.sub(minExtent);
        this.prevDrawOrigin = minExtent;
        //  highlight region that was drawn over
        //ctx.fillRect(this.prevDrawOrigin.x, this.prevDrawOrigin.y, this.prevDrawSize.x, this.prevDrawSize.y);

        requestAnimationFrame(this.drawOverlay.bind(this));
    }

    private drawCursor() {
        const ctx = this.cursorCanvas.getContext('2d');
        const width = this.cursorCanvas.width;
        const height = this.cursorCanvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = "rgba(100,100,100, 0.8)";
        switch (this.currentTool) {
            case Tool.Drop:
                const radius = this.currentToolParameters.radius;
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            default:

        }
    }

    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
    }


}