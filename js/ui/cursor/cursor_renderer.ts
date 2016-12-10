///<reference path="../../models/vector.ts"/>
///<reference path="../../drawing_utilities.ts"/>

interface CursorRenderer {
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2]
    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2]
}


class CircleRenderer implements CursorRenderer {
    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }

    private _radius: number = 50;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;
    constructor() {
        this.canvas = document.createElement("canvas");
    }

    private updateCursor() {
        this.canvas.width = this._radius * 2 + 3;
        this.canvas.height = this._radius * 2 + 3;
        const ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = "rgba(100,100,100,0.3)";
        const origin = new Vec2(this.canvas.width / 2, this.canvas.height / 2);
        circle(ctx, origin, this._radius);
        ctx.stroke();
    }
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {
        if (this.dirty) {
            this.updateCursor();
            this.dirty = false;
        }
        const width = this.canvas.width;
        const height = this.canvas.height;
        const minPoint = new Vec2(position.x - width / 2, position.y - height / 2);
        ctx.drawImage(this.canvas, minPoint.x, minPoint.y);

        return [minPoint, new Vec2(width, height)]
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        return this.drawAtRest(ctx, cursor);
    }
}


class CrossRenderer implements CursorRenderer {
    size: number = 20;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    private updateCursor() {
        this.canvas.width = this.size + 4;
        this.canvas.height = this.size + 4;
        const ctx = this.canvas.getContext("2d");
        ctx.strokeStyle = "rgba(100,100,100, 0.4)";
        const origin = new Vec2(this.canvas.width / 2, this.canvas.height / 2);
        cross(ctx, origin, this.size);
        ctx.stroke();
    }
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {
        if (this.dirty) {
            this.updateCursor();
            this.dirty = false;
        }
        const width = this.canvas.width;
        const height = this.canvas.height;
        const minPoint = new Vec2(position.x - width / 2, position.y - height / 2);
        ctx.drawImage(this.canvas, minPoint.x, minPoint.y);

        return [minPoint, new Vec2(width, height)];
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        return this.drawAtRest(ctx, cursor);
    }

}