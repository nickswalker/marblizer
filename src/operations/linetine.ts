import Operation, {Displacement, InkDeposit} from "./color_operations.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";

export function fmod(a: number, b: number): number {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
}

export default class LineTine implements Operation, Displacement {
    // N in the paper
    readonly normal: Vec2;
    // L in the paper
    readonly line: Vec2;
    // A in the paper
    readonly origin: Vec2;
    readonly numTines: number;
    readonly spacing: number;
    readonly alpha = 30.0;
    readonly lambda = 32;
    // How far the effect reaches past the dragged segment's ends before
    // fading out. Large values (the default) make the comb run the length
    // of the canvas, matching the original unbounded behavior; small values
    // localize it to roughly the drag itself.
    readonly reach: number;
    readonly dragLength: number;
    readonly deposit: InkDeposit | null = null;
    readonly newBaseColor: Color | null = null;

    constructor(origin: Vec2, direction: Vec2, numTines: number, spacing: number, reach: number = 4000) {
        const strength = direction.length();
        this.line = direction.norm();
        this.normal = this.line.perp().norm();
        this.origin = origin;
        this.numTines = numTines;
        this.spacing = spacing;
        this.reach = reach;
        this.dragLength = strength;

        this.alpha += strength / 10.0;
    }

    get displacement(): Displacement {
        return this;
    }

    atPoint(point: Vec2): Vec2 {
        const relative = point.sub(this.origin);
        let d = Math.abs(relative.dot(this.normal));
        const halfSpace = this.spacing / 2.0;

        if (d / this.spacing < this.numTines) {
            const test = fmod(d, this.spacing);
            d = halfSpace - Math.abs(test - halfSpace);
        } else {
            d = d - this.spacing * this.numTines;
        }

        const dLine = relative.dot(this.line);
        const overshoot = Math.max(0, -dLine, dLine - this.dragLength);
        const longitudinal = this.reach / (overshoot + this.reach);

        const factor = this.alpha * this.lambda / (d + this.lambda) * longitudinal;
        return this.line.copy().scale(factor);
    }

    // The displacement is parallel to `line`, so the perpendicular distance d
    // (and therefore the displacement magnitude) is unchanged by the move.
    // The inverse is simply the negated displacement.
    inverseAtPoint(point: Vec2): Vec2 {
        return this.atPoint(point).scale(-1);
    }
}
