import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import Operation from "../operations/color_operations.js";

export class Drop {
    points: Array<Vec2>;
    readonly color: Color;
    _cached_path: Path2D | null = null;
    private dirty: boolean = true;

    constructor(color: Color, points: Array<Vec2>) {
        this.color = color;
        this.points = points;
    }

    static circle(color: Color, radius: number, centerX: number, centerY: number): Drop {
        return new Drop(color, Drop.initialCirclePoints(radius, centerX, centerY));
    }

    private static initialCirclePoints(radius: number, centerX: number, centerY: number) {
        let points: Array<Vec2> = [];
        const desiredArcLength = 0.05;
        const stepSize = desiredArcLength / radius;
        for (let i = 0.0; i < 2 * Math.PI; i += stepSize) {
            const newPoint = new Vec2(centerX + radius * Math.cos(i), centerY + radius * Math.sin(i));
            points.push(newPoint)
        }
        return points;
    }

    getPath(): Path2D {
        if (!this.dirty) {
            return this._cached_path!;
        }
        let newPath = new Path2D();
        const firstPoint = this.points[0];
        newPath.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < this.points.length; i++) {
            const nextPoint = this.points[i];
            newPath.lineTo(nextPoint.x, nextPoint.y);
        }
        newPath.closePath();
        this._cached_path = newPath;
        this.dirty = false;
        return newPath;
    }

    makeDirty() {
        this.dirty = true;
    }

    clone(): Drop {
        return new Drop(this.color, this.points.slice());
    }
}

// The pure polyline simulation behind the vector renderer: tracks drops and
// base colour, and knows how operations affect them. Has no DOM/canvas
// dependency beyond Path2D/CanvasRenderingContext2D (both available in
// dedicated workers via OffscreenCanvas), so the same instance type can be
// driven from the main thread or from a worker.
export class CurveField {
    drops: Drop[] = [];
    baseColor: Color;
    private readonly defaultBaseColor: Color;

    constructor(baseColor: Color = new Color(220, 210, 210)) {
        this.defaultBaseColor = baseColor;
        this.baseColor = baseColor;
    }

    reset() {
        this.drops = [];
        this.baseColor = this.defaultBaseColor;
    }

    // Cheap, history-independent copy used to render a candidate operation's
    // effect without mutating the committed field: clone, apply the one
    // candidate operation, render, then discard.
    clone(): CurveField {
        const copy = new CurveField(this.baseColor);
        copy.drops = this.drops.map((drop) => drop.clone());
        return copy;
    }

    applyOperations(operations: Operation[]) {
        for (let i = 0; i < operations.length; i++) {
            this.applyOperation(operations[i]);
        }
        for (let i = 0; i < this.drops.length; i++) {
            this.drops[i].getPath();
        }
    }

    // Realizes a single operation against the polyline field: spread existing
    // ink by the operation's forward displacement, then deposit any new ink on
    // top, then apply any base-colour change. This is the one place that knows
    // how operations affect the vector representation.
    private applyOperation(operation: Operation) {
        const displacement = operation.displacement;
        if (displacement != null) {
            for (let d = 0; d < this.drops.length; d++) {
                const drop = this.drops[d];
                for (let p = 0; p < drop.points.length; p++) {
                    const oldPoint = drop.points[p];
                    drop.points[p] = oldPoint.add(displacement.atPoint(oldPoint));
                }
                drop.makeDirty();
            }
        }

        const deposit = operation.deposit;
        if (deposit != null) {
            this.drops.push(Drop.circle(deposit.color, deposit.radius, deposit.center.x, deposit.center.y));
        }

        if (operation.newBaseColor != null) {
            this.baseColor = operation.newBaseColor;
        }
    }

    renderTo(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.fillStyle = this.baseColor.toRGBString();
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < this.drops.length; i++) {
            const drop = this.drops[i];
            ctx.fillStyle = drop.color.toRGBString();
            ctx.fill(drop.getPath());
        }
    }
}
