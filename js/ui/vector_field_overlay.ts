interface VectorField {
    atPoint(point: Vec2): Vec2
}

class UniformVectorField implements VectorField {
    atPoint(point: Vec2): Vec2 {
        return new Vec2(0, 1);
    }
}


class SinVectorField implements VectorField {
    atPoint(point: Vec2): Vec2 {
        return new Vec2(Math.sin(0.01 * point.x), Math.sin(0.01 * point.x));
    }
}


class VectorFieldOverlay {
    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private spacing: number = 20;
    private arrowCanvas: HTMLCanvasElement;
    private visible: boolean = false;
    vectorField: VectorField = new SinVectorField();

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayContext = this.overlayCanvas.getContext("2d");
        container.appendChild(this.overlayCanvas);

        this.arrowCanvas = document.createElement('canvas');
        this.arrowCanvas.height = 20;
        this.arrowCanvas.width = 6;
        this.drawArrow();
        this.drawOverlay();

    }

    private drawOverlay() {
        const ctx = this.overlayContext;
        const width = this.arrowCanvas.width;
        const height = this.arrowCanvas.height;
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        for (let x = 0; x < this.overlayCanvas.width; x += this.spacing) {
            for (let y = 0; y < this.overlayCanvas.height; y += this.spacing) {
                const dir = this.vectorField.atPoint(new Vec2(x, y));
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
        if (this.visible) {
            requestAnimationFrame(this.drawOverlay.bind(this));
        }
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