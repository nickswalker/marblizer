///<reference path="models/vector.ts"/>
///<reference path="models/color.ts"/>
///<reference path=".d.ts"/>
///<reference path="ui/panes.ts"/>
///<reference path="operations/operations.ts"/>

class Drop {
    points: Array<Vec2>;
    private dirty: boolean = true;
    readonly color: Color;

    _cached_path: Path2D;
    constructor(color: Color, radius: number, centerX: number, centerY: number) {
        this.color = color;
        this.points = Drop.initialCirclePoints(radius, centerX, centerY);

    }
    getPath() {
        if (!this.dirty) {
            return this._cached_path;
        }
        let newPath = new Path2D();
        const firstPoint = this.points[0];
        newPath.moveTo(firstPoint.x, firstPoint.y);
        for(let i = 1; i < this.points.length; i++) {
            const nextPoint = this.points[i];
            newPath.lineTo(nextPoint.x, nextPoint.y);
        }
        newPath.closePath();
        this._cached_path = newPath;
        this.dirty = false;
    }
    makeDirty() {
        this.dirty = true;
    }

    private static initialCirclePoints(radius: number, centerX: number, centerY: number) {
        let points: Array<Vec2> = [];
        const desiredArcLength = 0.1;
        const stepSize = desiredArcLength / radius;
        for (let i = 0.0; i < 2 * Math.PI; i += stepSize) {
            const newPoint = new Vec2(centerX + radius * Math.cos(i), centerY + radius * Math.sin(i));
            points.push(newPoint)
        }
        return points;
    }
}


class MarblingRenderer {
    renderCanvas: HTMLCanvasElement;
    drops: Drop[] = [];
    context: CanvasRenderingContext2D;
    baseColor: Color = new Color(220,210,210);

    private history: [Operation];

    constructor(container: HTMLElement) {
        this.renderCanvas = document.createElement("canvas");
        this.renderCanvas.className = "marbling-render-layer";
        container.insertBefore(this.renderCanvas, container.firstChild);
        this.context = this.renderCanvas.getContext("2d");
        window.requestAnimationFrame(this.draw.bind(this));
    }

    setSize(width: number, height: number) {
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
    }

    draw() {
        this.context.fillStyle = this.baseColor.toRGBString();
        this.context.fillRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        for (let i = 0; i < this.drops.length; i ++) {
            const drop = this.drops[i];
            this.context.fillStyle = drop.color.toRGBString();
            this.context.fill(drop.getPath());
        }

        window.requestAnimationFrame(this.draw.bind(this));
    }

    reset() {
        this.drops = []
    }

    applyOperations(operations: [Operation]) {
        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            operation.apply(this);
        }
    }

}

