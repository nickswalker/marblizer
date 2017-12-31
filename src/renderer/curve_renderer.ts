import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import Operation from "../operations/color_operations.js";
import AtPointApplicator from "../operations/at_point_applicator.js";

export class Drop {
    points: Array<Vec2>;
    readonly color: Color;
    _cached_path: Path2D;
    private dirty: boolean = true;

    constructor(color: Color, radius: number, centerX: number, centerY: number) {
        this.color = color;
        this.points = Drop.initialCirclePoints(radius, centerX, centerY);

    }

    private static initialCirclePoints(radius: number, centerX: number, centerY: number) {
        let points: Array<Vec2> = [];
        const desiredArcLength = 0.05;
        const stepSize = desiredArcLength / radius;
        for (let i = 0.0; i < 2 * Math.PI; i += stepSize) {
            const newPoint = new Vec2(centerX + radius * Math.cos(i), centerY + radius * Math.sin(i));
            points.push(newPoint)
        }
        return points;
    }

    getPath() {
        if (!this.dirty) {
            return this._cached_path;
        }
        let newPath = new Path2D();
        const firstPoint = this.points[0];
        newPath.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < this.points.length; i++) {
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
}


export default interface MarblingRenderer {
    applyOperations(operations: Operation[]);
    save();
    reset();

    setSize(width: number, height: number);
}

export class InteractiveCurveRenderer implements MarblingRenderer {
    renderCanvas: HTMLCanvasElement;
    displayCanvas: HTMLCanvasElement;
    drops: Drop[] = [];
    baseColor: Color = new Color(220, 210, 210);
    private applicator: AtPointApplicator;
    private dirty: boolean = true;
    private history: Operation[] = [];

    constructor(container: HTMLElement) {
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        container.insertBefore(this.displayCanvas, container.firstChild);
        this.renderCanvas = document.createElement("canvas");
        this.applicator = new AtPointApplicator();
        this.render();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    setSize(width: number, height: number) {
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.dirty = true;
    }

    render() {
        const ctx = this.renderCanvas.getContext("2d");
        ctx.fillStyle = this.baseColor.toRGBString();
        ctx.fillRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            ctx.fillStyle = drop.color.toRGBString();
            ctx.fill(drop.getPath());
        }
    }

    draw() {
        if (this.dirty) {
            this.render();
            this.dirty = false;
        }
        const ctx = this.displayCanvas.getContext("2d");
        ctx.drawImage(this.renderCanvas, 0, 0);
        window.requestAnimationFrame(this.draw.bind(this));
    }

    reset() {
        this.drops = [];
        this.dirty = true;
    }

    applyOperations(operations: Operation[]) {
        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            this.applicator.apply(operation, this);
        }
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            drop.getPath();
        }
        this.dirty = true;
        this.history.concat(operations);
    }

    save() {
        const newWindow = window.open('about:new', 'Ink Marbling Image');
        newWindow.document.write("<img src='" + this.renderCanvas.toDataURL("image/png") + "' alt='from canvas'/>");
        newWindow.close();
    }

}

