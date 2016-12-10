///<reference path="cursor_renderer.ts"/>
class DynamicRadiusRenderer implements CursorRenderer {
    private _radius: number = 50;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;
    private crossRenderer: CrossRenderer;
    private circleRenderer: CircleRenderer;

    constructor() {
        this.canvas = document.createElement("canvas");
        this.crossRenderer = new CrossRenderer();
        this.circleRenderer = new CircleRenderer();
    }

    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
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
        return this.crossRenderer.drawAtRest(ctx, position);
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        const [crossMin, crossSize] = this.crossRenderer.drawAtRest(ctx, cursor);
        this.circleRenderer.radius = mouseDown.sub(cursor).length();
        const [circleMin, circleSize] = this.circleRenderer.drawAtRest(ctx, mouseDown);

        ctx.beginPath();
        ctx.moveTo(mouseDown.x, mouseDown.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.closePath();
        ctx.stroke();
        circle(ctx, mouseDown, 3);
        ctx.fill();

        const min = vecMin(crossMin, circleMin);
        const max = vecMax(crossMin.add(crossSize), circleMin.add(circleSize));
        return [min, max.sub(min)];
    }
}