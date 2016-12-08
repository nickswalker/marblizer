///<reference path="../models/vector.ts"/>
function circle(ctx: CanvasRenderingContext2D, origin: Vec2, radius: number) {
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
}

function cross(ctx: CanvasRenderingContext2D, origin: Vec2, height: number) {
    ctx.beginPath();
    const top = new Vec2(origin.x, origin.y - height/2);
    const left = new Vec2(origin.x - height /2, origin.y - height/2);
    ctx.moveTo(100, 90);
    ctx.lineTo(100, 110);
    ctx.closePath();

    ctx.moveTo(90, 100);
    ctx.lineTo(110, 100);
    ctx.stroke();
    ctx.closePath();
}

interface CursorRenderer {
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2]
    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2]
}

class TineRenderer {
    spacing: number;
    numTines: number;
    private dirty: boolean = true;
    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        ctx.beginPath();
        ctx.moveTo(mouseDown.x, mouseDown.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.closePath();
        ctx.stroke();
        const minPoint = vecMin(cursor, mouseDown);
        const maxPoint = vecMax(cursor, mouseDown);


        ctx.fillStyle = "rgba(100,100,100, 0.4)";
        const spacing = this.spacing;
        const numTines = this.numTines;
        const dir = mouseDown.sub(mouseDown).norm().perp();
        for (let i = 0; i <= numTines; i++) {
            const tineOrigin = mouseDown.add(dir.copy().scale(i * spacing));
            circle(ctx, tineOrigin);
            const secondOrigin = mouseDown.add(dir.copy().scale(-i * spacing));
            circle(ctx, secondOrigin);

            maxExtent = vecMax(maxExtent, tineOrigin);
            maxExtent = vecMax(maxExtent, secondOrigin);
            minExtent = vecMin(minExtent, tineOrigin);
            minExtent = vecMin(minExtent, secondOrigin);
        }
        // Wiggle room to account for stroke width
        minExtent = minExtent.sub(new Vec2(5, 5));
        maxExtent = maxExtent.add(new Vec2(5, 5));
    }
}

class CircleRenderer {
    radius: number;
    private dirty: boolean = true;
    private canvas: HTMLCanvasElement;
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 206;
        this.canvas.height = 206
}
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {
        const octx = this.canvas.getContext("2d");
        if (this.dirty) {
            circle(octx, position, this.radius);
            octx.stroke();
        }
        const width = this.canvas.width;
        const height = this.canvas.height;
        const minPoint = new Vec2(position.x - width / 2, position.y - height / 2);
        ctx.drawImage(this.canvas, minPoint.x, minPoint.y);

        return [minPoint, minPoint.add(new Vec2(width, height))]

    }
}

class CrossRenderer {
    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {

    }
}