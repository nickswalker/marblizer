///<reference path="../../models/vector.ts"/>
function circle(ctx: CanvasRenderingContext2D, origin: Vec2, radius: number) {
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
}

function cross(ctx: CanvasRenderingContext2D, origin: Vec2, height: number) {
    ctx.beginPath();
    const top = new Vec2(origin.x, origin.y - height/2);
    const bottom = top.add(new Vec2(0, height));
    const left = new Vec2(origin.x - height / 2, origin.y);
    const right = left.add(new Vec2(height, 0));
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.closePath();

    ctx.moveTo(left.x, left.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();
    ctx.closePath();
}

interface CursorRenderer {
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2]
    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2]
}

class TineRenderer implements CursorRenderer {
    set numTines(value: number) {
        this._numTines = value;
        this.dirty = true;
    }

    set spacing(value: number) {
        this._spacing = value;
        this.dirty = true;
    }

    private _spacing: number;
    private _numTines: number;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;

    private r = 3;

    constructor() {
        this.canvas = document.createElement("canvas");
    }

    private updateCursor() {
        const width = (2 * this._numTines + 1) * this.r + (2 * this._numTines) * this._spacing;
        const height = 11;
        this.canvas.width = width;
        this.canvas.height = height;
        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "rgba(100,100,100, 0.4)";

        const mid = new Vec2(width, height).scale(0.5);
        for (let i = 0; i <= this._numTines; i++) {
            const tineOrigin = mid.add(new Vec2(i * this._spacing, 0));
            circle(ctx, tineOrigin, this.r);
            ctx.fill();
            if (i == 0) {
                continue;
            }
            const secondOrigin = mid.add(new Vec2(-i * this._spacing, 0));
            circle(ctx, secondOrigin, this.r);
            ctx.fill();
        }
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


        let minPoint = vecMin(cursor, mouseDown);
        let maxPoint = vecMax(cursor, mouseDown);
        minPoint = minPoint.sub(new Vec2(2, 2));
        maxPoint = maxPoint.add(new Vec2(2, 2));

        const tineAxis = mouseDown.sub(cursor).norm().perp();
        const tineAngle = tineAxis.angle();
        const midX = this.canvas.width / 2;
        const midY = this.canvas.height / 2;

        const centerX = mouseDown.x;
        const centerY = mouseDown.y;
        ctx.translate(centerX, centerY);
        ctx.rotate(tineAngle);
        ctx.drawImage(this.canvas, -midX, -midY);
        ctx.rotate(-tineAngle);
        ctx.translate(-centerX, -centerY);

        const halfLength = new Vec2(Math.max(midX, midY), Math.max(midX, midY));
        const minExtent = vecMin(minPoint, mouseDown.sub(halfLength));
        const maxExtent = vecMax(maxPoint, mouseDown.add(halfLength));

        return [minExtent, maxExtent.sub(minExtent)];

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
        const octx = this.canvas.getContext("2d");
        const origin = new Vec2(this.canvas.width / 2, this.canvas.height / 2);
        cross(octx, origin, this.size);
        octx.stroke();
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


