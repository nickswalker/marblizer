import {CircleRenderer, CrossRenderer, default as CursorRenderer} from "./cursor_renderer.js";
import Vec2, {vecMax, vecMin} from "../../models/vector.js";
import {circle} from "../../drawing_utilities.js";
import {counterclockwiseForDrag} from "../../operations/rotation_direction.js";

// Number of spin-direction arrowheads drawn around the drag radius. Few
// enough to read at a glance, many enough that the rotation is obvious from
// any angle of view.
const ARROW_COUNT = 8;

// Cursor preview for tools that rotate ink around a center point (Vortex,
// Circular tine). Besides the usual drag-radius circle, draws arrowheads
// tangent to the circle showing which way the rotation will spin -- the
// spin direction itself is derived from which half (above or below the
// mousedown point) the drag currently sits in, so this is the only way the
// user can see/confirm it before committing.
export default class SpinRenderer implements CursorRenderer {
    private crossRenderer = new CrossRenderer();
    private circleRenderer = new CircleRenderer();

    drawAtRest(ctx: CanvasRenderingContext2D, position: Vec2): [Vec2, Vec2] {
        return this.crossRenderer.drawAtRest(ctx, position);
    }

    drawActive(ctx: CanvasRenderingContext2D, mouseDown: Vec2, cursor: Vec2): [Vec2, Vec2] {
        const direction = cursor.sub(mouseDown);
        const radius = direction.length();

        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.moveTo(mouseDown.x, mouseDown.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.closePath();
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.moveTo(mouseDown.x, mouseDown.y);
        ctx.lineTo(cursor.x, cursor.y);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        circle(ctx, mouseDown, 4);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        circle(ctx, mouseDown, 2);
        ctx.fill();

        const [crossMin, crossSize] = this.crossRenderer.drawAtRest(ctx, cursor);
        this.circleRenderer.radius = radius;
        const [circleMin, circleSize] = this.circleRenderer.drawAtRest(ctx, mouseDown);

        let min = vecMin(crossMin, circleMin);
        let max = vecMax(crossMin.add(crossSize), circleMin.add(circleSize));

        if (radius > 12) {
            const [arrowMin, arrowMax] = this.drawSpinArrows(ctx, mouseDown, direction, radius);
            min = vecMin(min, arrowMin);
            max = vecMax(max, arrowMax);
        }

        return [min, max.sub(min)];
    }

    private drawSpinArrows(ctx: CanvasRenderingContext2D, center: Vec2, direction: Vec2, radius: number): [Vec2, Vec2] {
        const counterclockwise = counterclockwiseForDrag(direction);
        const arrowSize = Math.min(12, Math.max(6, radius * 0.12));
        let min = new Vec2(center.x, center.y);
        let max = new Vec2(center.x, center.y);

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 1;
        for (let i = 0; i < ARROW_COUNT; i++) {
            const angle = (i / ARROW_COUNT) * 2 * Math.PI;
            const point = center.add(new Vec2(Math.cos(angle), Math.sin(angle)).scale(radius));
            const tangentAngle = angle + (counterclockwise ? -Math.PI / 2 : Math.PI / 2);
            this.drawArrowhead(ctx, point, tangentAngle, arrowSize);

            min = vecMin(min, new Vec2(point.x - arrowSize, point.y - arrowSize));
            max = vecMax(max, new Vec2(point.x + arrowSize, point.y + arrowSize));
        }
        return [min, max];
    }

    private drawArrowhead(ctx: CanvasRenderingContext2D, tip: Vec2, angle: number, size: number) {
        const dir = new Vec2(Math.cos(angle), Math.sin(angle));
        const perp = new Vec2(-dir.y, dir.x);
        const back = tip.sub(dir.scale(size));
        const left = back.add(perp.scale(size * 0.5));
        const right = back.sub(perp.scale(size * 0.5));

        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}
