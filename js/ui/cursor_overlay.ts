///<reference path="panes.ts"/>
class CursorOverlay {

    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private cursorCanvas: HTMLCanvasElement;

    private mouseX: number;
    private mouseY: number;

    private prevDrawMaxX: number;
    private prevDrawMaxY: number;

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

        container.onmousemove = this.mouseMove.bind(this);
        document.addEventListener("toolchange", this.toolChange.bind(this));

        this.drawCursor();
        this.drawOverlay();


    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameters = e.detail.parameters;
        this.drawCursor();
    }

    private mouseMove(e: MouseEvent) {
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
    }

    private drawOverlay() {
        this.overlayContext.clearRect(this.prevDrawMaxX, this.prevDrawMaxY, 200, 200);
        const newX = this.mouseX - (this.cursorCanvas.width / 2);
        const newY = this.mouseY - (this.cursorCanvas.height / 2);
        this.overlayContext.drawImage(this.cursorCanvas, newX, newY);
        this.prevDrawMaxX = newX;
        this.prevDrawMaxY = newY;
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
                ctx.beginPath();
                ctx.moveTo(100, 90);
                ctx.lineTo(100, 110);
                ctx.stroke();

                ctx.moveTo(90, 100);
                ctx.lineTo(110, 100);
                ctx.stroke();
        }
    }

    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
    }


}