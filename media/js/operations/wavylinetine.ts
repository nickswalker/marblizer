///<reference path="../models/vector.ts"/>
///<reference path="color_operations.ts"/>
///<reference path="../ui/vector_field_overlay.ts"/>
Math.fmod = function (a, b) {
    return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
};
class WavyLineTine implements Operation, VectorField {
    // L in the paper
    readonly line: Vec2;
    // A in the paper
    readonly origin: Vec2;
    readonly numTines: number;
    readonly spacing: number;
    readonly alpha: number = 30.0;
    readonly lambda: number = 32;
    readonly amplitude: number = 10;
    readonly phase: number = 0.0;
    readonly angle: number;
    readonly wavelength: number = 400.0;

    constructor(origin: Vec2, direction: Vec2, numTines: number, spacing: number) {
        const strength = direction.length();
        this.line = direction.norm().perp();
        this.origin = origin;
        this.numTines = numTines;
        this.spacing = spacing;
        this.angle = this.line.angle();
        this.amplitude += strength / 10.0;
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
        const sinT = Math.sin(this.angle);
        const cosT = Math.cos(this.angle);

        const v = point.dot(new Vec2(sinT, -cosT));
        const factor = this.amplitude * Math.sin(2 * Math.PI / this.wavelength * v + this.phase);

        return new Vec2(cosT, sinT).scale(factor);
    }

}