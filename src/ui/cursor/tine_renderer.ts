import CursorRenderer, {CrossRenderer} from "./cursor_renderer.js";
import FunctionRenderer from "./function_renderer.js";
import Vec2 from "../../models/vector.js";
import {circle} from "../../drawing_utilities.js";

function line(t: number) {
    return 0;
}

export default class TineRenderer implements CursorRenderer {
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;
    private crossRenderer: CrossRenderer;
    private functionRenderer: FunctionRenderer;
    private r = 4;

    constructor(func: Function = line) {
        this.canvas = document.createElement("canvas");
        this.crossRenderer = new CrossRenderer();

        this.functionRenderer = new FunctionRenderer(-1000, 1000);
        this.functionRenderer.functionToRender = func;
    }

    private _spacing: number;

    set spacing(value: number) {
        this._spacing = value;
        this.dirty = true;
    }

    private _numTines: number;

    set numTines(value: number) {
        this._numTines = value;
        this.dirty = true;
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        if (this.dirty) {
            this.updateCursor();
            this.dirty = false;
        }
        // Draw line between cursor and mousedown
        ctx.beginPath();
        ctx.moveTo(mouseDown.x, mouseDown.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.closePath();
        ctx.stroke();

        this.crossRenderer.drawAtRest(ctx, cursor);


        const lineAxis = mouseDown.sub(cursor).norm();
        const tineAxis = lineAxis.perp();
        const tineAngle = tineAxis.angle();

        const mid = new Vec2(this.canvas.width / 2, this.canvas.height / 2);

        const centerX = mouseDown.x;
        const centerY = mouseDown.y;
        ctx.translate(centerX, centerY);
        ctx.rotate(tineAngle);
        ctx.drawImage(this.canvas, -mid.x, -mid.y);
        ctx.rotate(-tineAngle);
        ctx.translate(-centerX, -centerY);


        const lineAngle = lineAxis.angle();

        ctx.translate(centerX, centerY);
        ctx.rotate(lineAngle);
        for (let i = 0; i <= this._numTines; i++) {

            ctx.translate(0, i * this._spacing);
            this.functionRenderer.draw(ctx, new Vec2(0, 0));
            ctx.translate(0, -i * this._spacing);
            if (i == 0) {
                continue;
            }
            ctx.translate(0, -i * this._spacing);
            this.functionRenderer.draw(ctx, new Vec2(0, 0));
            ctx.translate(0, i * this._spacing);


        }
        ctx.rotate(-lineAngle);
        ctx.translate(-centerX, -centerY);

        return [Vec2.zero(), new Vec2(ctx.canvas.width, ctx.canvas.height)];

    }

    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {
        if (this.dirty) {
            this.updateCursor();
            this.dirty = false;
        }
        const midX = this.canvas.width / 2;
        const midY = this.canvas.height / 2;
        const minExtent = new Vec2(position.x - midX, position.y - midY);
        ctx.drawImage(this.canvas, minExtent.x, minExtent.y);

        return [minExtent, new Vec2(this.canvas.width, this.canvas.height)];
    }

    private updateCursor() {
        const width = 2 * (this._numTines + 1) * this.r + (2 * this._numTines) * this._spacing;
        const height = 11;
        this.canvas.width = width;
        this.canvas.height = height;
        const ctx = this.canvas.getContext("2d");


        const mid = new Vec2(width, height).scale(0.5);
        for (let i = 0; i <= this._numTines; i++) {
            ctx.fillStyle = "rgba(0,0,0, 0.8)";
            const tineOrigin = mid.add(new Vec2(i * this._spacing, 0));
            circle(ctx, tineOrigin, this.r);
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,255,0.8)";
            circle(ctx, tineOrigin, this.r - 1);
            ctx.fill();
            if (i == 0) {
                continue;
            }
            const secondOrigin = mid.add(new Vec2(-i * this._spacing, 0));
            ctx.fillStyle = "rgba(0,0,0, 0.8)";
            circle(ctx, secondOrigin, this.r);
            ctx.fill();

            ctx.fillStyle = "rgba(255,255,255,0.8)";
            circle(ctx, secondOrigin, this.r - 1);
            ctx.fill();
        }
    }
}