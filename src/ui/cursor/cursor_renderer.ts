import Vec2 from "../../models/vector.js";
import {circle, cross} from "../../drawing_utilities.js";

export default interface CursorRenderer {
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2]

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2]
}


export class CircleRenderer implements CursorRenderer {
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    private _radius: number = 50;

    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
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

    private updateCursor() {
        if (this._radius < 3) {
            return;
        }
        this.canvas.width = this._radius * 2 + 4;
        this.canvas.height = this._radius * 2 + 4;
        const ctx = this.canvas.getContext("2d");

        const origin = new Vec2(this.canvas.width / 2, this.canvas.height / 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        circle(ctx, origin, this._radius);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        circle(ctx, origin, this._radius - 2);
        ctx.stroke();
    }
}


export class CrossRenderer implements CursorRenderer {
    size: number = 20;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
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

    private updateCursor() {
        this.canvas.width = this.size + 4;
        this.canvas.height = this.size + 4;
        const ctx = this.canvas.getContext("2d");
        const origin = new Vec2(this.canvas.width / 2, this.canvas.height / 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        cross(ctx, origin, this.size + 2);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        cross(ctx, origin, this.size);
        ctx.stroke();
    }

}