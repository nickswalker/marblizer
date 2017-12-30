import Vec2 from "../models/vector.js";
import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import {InteractiveCurveRenderer} from "../renderer/curve_renderer.js";
import Mat2x2 from "../models/matrix.js";

export default class CircularLineTine implements Operation {
    // C in the paper
    readonly center: Vec2;
    readonly radius: number;
    readonly numTines: number;
    readonly interval: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    readonly counterClockwise: boolean;

    constructor(origin: Vec2, radius: number, numTines: number, interval: number, counterClockwise: boolean = false) {
        this.radius = radius;
        this.center = origin;
        this.numTines = numTines;
        this.interval = interval;
        this.counterClockwise = counterClockwise;
    }

}