import Operation, {Displacement, InkDeposit} from "./color_operations.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";

export default class WavyLineTine implements Operation, Displacement {
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
    readonly deposit: InkDeposit | null = null;
    readonly newBaseColor: Color | null = null;

    constructor(origin: Vec2, direction: Vec2, numTines: number, spacing: number) {
        const strength = direction.length();
        this.line = direction.norm().perp();
        this.origin = origin;
        this.numTines = numTines;
        this.spacing = spacing;
        this.angle = this.line.angle();
        this.amplitude += strength / 10.0;
    }

    get displacement(): Displacement {
        return this;
    }

    atPoint(point: Vec2): Vec2 {
        const sinT = Math.sin(this.angle);
        const cosT = Math.cos(this.angle);

        const v = point.dot(new Vec2(sinT, -cosT));
        const factor = this.amplitude * Math.sin(2 * Math.PI / this.wavelength * v + this.phase);

        return new Vec2(cosT, sinT).scale(factor);
    }

    // The displacement is along (cosθ, sinθ), which is perpendicular to the
    // axis (sinθ, −cosθ) that the wave is sampled on, so that sample value
    // (and the displacement magnitude) is preserved. The inverse negates it.
    inverseAtPoint(point: Vec2): Vec2 {
        return this.atPoint(point).scale(-1);
    }
}
