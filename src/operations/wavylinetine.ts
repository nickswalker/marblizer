import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import Vec2 from "../models/vector.js";
import {InteractiveCurveRenderer} from "../renderer/curve_renderer.js";

export default class WavyLineTine implements Operation {
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

}