import Vec2 from "../../models/vector.js";
import CursorRenderer from "./cursor_renderer.js";
import {circle} from "../../drawing_utilities.js";

// Shows the actual shape of the spatter deposit region: a circle sized to
// scatterRadius, with a smaller circle at the center sized to dropRadius so
// the configured drop size is visible too.
export default class SpatterRenderer implements CursorRenderer {
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    private _radius: number = 100;

    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }

    private _dropRadius: number = 10;

    set dropRadius(value: number) {
        this._dropRadius = value;
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

        return [minPoint, new Vec2(width, height)];
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        return this.drawAtRest(ctx, cursor);
    }

    private updateCursor() {
        const half = this._radius;
        const size = half * 2 + 4;
        this.canvas.width = size;
        this.canvas.height = size;
        const ctx = this.canvas.getContext("2d")!;

        const mid = size / 2;
        const origin = new Vec2(mid, mid);

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        circle(ctx, origin, half);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        circle(ctx, origin, half - 2);
        ctx.stroke();

        if (this._dropRadius >= 2) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(0,0,0,0.8)";
            circle(ctx, origin, this._dropRadius);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            circle(ctx, origin, this._dropRadius - 2);
            ctx.stroke();
        }
    }
}
