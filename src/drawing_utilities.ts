import Vec2 from "./models/vector.js";

export function circle(ctx: CanvasRenderingContext2D, origin: Vec2, radius: number) {
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
}

export function cross(ctx: CanvasRenderingContext2D, origin: Vec2, height: number) {
    ctx.beginPath();
    const top = new Vec2(origin.x, origin.y - height / 2);
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