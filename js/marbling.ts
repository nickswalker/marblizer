/// <reference path=".d.ts"/>
/// <reference path="ui.ts"/>
/// <reference path="vector.ts"/>
class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a:number=1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toFillStyle() {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
}



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
        for(let i = 0.0; i < 2 * Math.PI; i+= 0.05 ) {
            const newPoint = new Vec2(centerX + radius * Math.cos(i), centerY + radius * Math.sin(i));
            points.push(newPoint)
        }
        return points;
    }
}


class MarblingRenderer {
    domElement: HTMLCanvasElement;
    drops: Drop[] = [];
    context: CanvasRenderingContext2D;
    baseColor: Color = new Color(199,49,5);
    currentTool: Tool = Tool.Tine;
    currentColor: Color = new Color(255,255,255);
    constructor() {
        this.domElement = document.createElement("canvas");
        this.domElement.onmousedown = this.mouseDown.bind(this);
        this.domElement.onmouseup = this.mouseUp.bind(this);
        this.context = this.domElement.getContext("2d");
        window.requestAnimationFrame(this.draw.bind(this));
    }
    setSize(width: number, height: number) {
        this.domElement.height = height;
        this.domElement.width = width;
    }

    draw() {
        this.context.fillStyle = this.baseColor.toFillStyle();
        this.context.fillRect(0,0,this.domElement.width, this.domElement.height);
        for (let i = 0; i < this.drops.length; i ++) {
            const drop = this.drops[i];
            this.context.fillStyle = drop.color.toFillStyle();
            this.context.fill(drop.getPath());
        }
        window.requestAnimationFrame(this.draw.bind(this));
    }

    reset() {
        this.drops = []
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.currentTool) {
            case Tool.Drop:
                break
        }
    }
    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.currentTool) {
            case Tool.Drop:

                this.applyDrop(this.currentColor, 10,x, y);
                break;
        }
    }

    private applyDrop(color: Color, radius: number, centerX: number, centerY: number) {
        let newDrop = new Drop(color,radius,centerX,centerY);
        const center = new Vec2(centerX, centerY);
        const radius2 = Math.pow(radius, 2);
        for (let d = 0; d < this.drops.length; d++) {
            let drop = this.drops[d];
            for (let p = 0; p < drop.points.length; p++) {

                const oldPoint = drop.points[p];
                const pointDir = oldPoint.sub(center);
                const factor = Math.sqrt(1 + (radius2 /Math.pow(pointDir.length(),2)));

                const newPoint = center.add(pointDir.scale(factor));
                drop.points[p] = newPoint;
            }
            drop.makeDirty();
        }

        this.drops.push(newDrop);
    }

    toolDidChange(tool: Tool) {
        this.currentTool = tool;
    }
    colorDidChange(color: Color) {
        this.currentColor = color;
    }
    didRequestReset() {
        this.reset();
    }
}

