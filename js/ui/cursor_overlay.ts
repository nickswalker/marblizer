class CursorOverlay {
    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private cursorCanvas: HTMLCanvasElement;

    private mouseX: number;
    private mouseY: number;

    private prevDrawMaxX: number;
    private prevDrawMaxY: number;

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayContext = this.overlayCanvas.getContext("2d");
        container.appendChild(this.overlayCanvas);

        this.cursorCanvas = document.createElement("canvas");
        this.cursorCanvas.width = 200;
        this.cursorCanvas.height = 200;
        container.onmousemove = this.mouseMove.bind(this);
        this.drawOverlay();
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
        const radius = 50;
        const ctx = this.cursorCanvas.getContext('2d');
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.arc(this.cursorCanvas.width / 2, this.cursorCanvas.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
    }

    cursorDidChange() {
        this.drawCursor();
    }
}