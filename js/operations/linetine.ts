///<reference path="../models/vector.ts"/>
///<reference path="color_operations.ts"/>
///<reference path="../ui/vector_field_overlay.ts"/>
Math.fmod = function (a, b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
};
class LineTine implements Operation, VectorField {
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

    constructor(origin: Vec2, direction: Vec2, numTines: number, spacing: number) {
        const strength = direction.length();
        this.line = direction.norm();
        this.normal = this.line.perp().norm();
        this.origin = origin;
        this.numTines = numTines;
        this.spacing = spacing;

        this.alpha += strength / 10.0;
    }

    apply(renderer: InteractiveCurveRenderer) {

        for (let d = 0; d < renderer.drops.length; d++) {
            let drop = renderer.drops[d];
            for (let p = 0; p < drop.points.length; p++) {
                const oldPoint = drop.points[p];
                const offset = this.atPoint(oldPoint);
                drop.points[p] = oldPoint.add(offset);
            }
            drop.makeDirty();
        }
    }

    atPoint(point: Vec2): Vec2 {
        let d = Math.abs(point.sub(this.origin).dot(this.normal));
        const halfSpace = this.spacing / 2.0;

        if (d / this.spacing < this.numTines) {
            const test = Math.fmod(d, this.spacing);
            d = halfSpace - Math.abs(test - halfSpace);
        } else {
            d = d - this.spacing * this.numTines;
        }

        const factor = this.alpha * this.lambda / (d + this.lambda);
        return this.line.copy().scale(factor);
    }

}