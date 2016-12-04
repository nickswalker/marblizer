///<reference path="../models/vectorfield.ts"/>

class VectorFieldOverlay {
    private renderer: VectorFieldRenderer;
    private currentTool: Tool;
    private currentToolParameter: number;
    private lastMouseCoord: Vec2;
    private _previewOperation: Operation = null;

    constructor(container: HTMLElement) {
        this.renderer = new VectorFieldRenderer(container);
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this));
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.previewOperation = null;
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
                this.lastMouseCoord = new Vec2(x, y);
        }
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = null;
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        const mouseCoords = new Vec2(x, y);
        switch (this.currentTool) {
            case Tool.Drop:
                this.previewOperation = new InkDropOperation(mouseCoords, 10, null);

                break;
            case Tool.TineLine:
                if (this.lastMouseCoord != null) {
                    this.previewOperation = new LineTine(mouseCoords, mouseCoords.sub(this.lastMouseCoord), 1, 1);
                }
        }
    }

    set previewOperation(value: Operation) {
        this._previewOperation = value;
        this.renderer.vectorField = this._previewOperation;
    }

    setSize(width: number, height: number) {
        this.renderer.setSize(width, height);
    }

    toggleVisibility() {
        this.renderer.toggleVisibility();
    }
}

class VectorFieldRenderer {

    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private spacing: number = 20;
    private arrowCanvas: HTMLCanvasElement;
    private visible: boolean = false;
    private _vectorField: VectorField = new SinVectorField();

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.className = "marbling-vector-field-overlay";
        this.overlayContext = this.overlayCanvas.getContext("2d");
        container.appendChild(this.overlayCanvas);

        this.arrowCanvas = document.createElement('canvas');
        this.arrowCanvas.height = 20;
        this.arrowCanvas.width = 6;
        this.drawArrow();
        this.drawOverlay();

    }

    set vectorField(value: VectorField) {
        this._vectorField = value;
        //  if the vectorfield is already rendering, it'll switch out automatically
    }

    private drawOverlay() {
        if (!this.visible) {
            return;
        }

        const ctx = this.overlayContext;
        const width = this.arrowCanvas.width;
        const height = this.arrowCanvas.height;
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        if (this._vectorField == null) {
            requestAnimationFrame(this.drawOverlay.bind(this));
            return;
        }

        for (let x = 0; x < this.overlayCanvas.width; x += this.spacing) {
            for (let y = 0; y < this.overlayCanvas.height; y += this.spacing) {
                const dir = this._vectorField.atPoint(new Vec2(x, y));
                const angle = dir.angle();
                const size = dir.length();
                if (size > 0) {
                    ctx.translate(x, y);
                    ctx.scale(size, size);
                    ctx.rotate(angle);
                    ctx.drawImage(this.arrowCanvas, -width / 2, -height / 2, width, height);
                    ctx.scale(1 / size, 1 / size);
                    ctx.rotate(-angle);
                    ctx.translate(-x, -y);
                }
            }
        }
        this.overlayContext.drawImage(this.arrowCanvas, 0, 0);
        requestAnimationFrame(this.drawOverlay.bind(this));

    }

    private drawArrow() {
        const ctx = this.arrowCanvas.getContext("2d");
        const path = new Path2D();
        path.moveTo(2, 0);
        path.lineTo(2, 2);
        path.lineTo(2, 12);
        path.lineTo(6, 12);
        path.lineTo(3, 20);
        path.lineTo(0, 12);
        path.lineTo(4, 12);
        path.lineTo(4, 0);
        path.lineTo(2, 0);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fill(path);
    }


    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
    }

    toggleVisibility() {
        if (this.visible) {
            this.visible = false;
            this.overlayCanvas.style.visibility = "hidden";
        } else {
            this.visible = true;
            this.overlayCanvas.style.visibility = "visible";
            this.drawOverlay();
        }
    }
}