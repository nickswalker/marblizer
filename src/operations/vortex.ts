import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import Vec2 from "../models/vector.js";
import {InteractiveCurveRenderer} from "../renderer/curve_renderer.js";
import Mat2x2 from "../models/matrix.js";

export default class Vortex implements Operation {
    // C in the paper
    readonly center: Vec2;
    readonly radius: number;
    readonly strength: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    readonly counterclockwise: boolean;

    constructor(origin: Vec2, radius: number, counterclockwise: boolean = false) {
        this.center = origin;
        this.radius = radius;
        this.counterclockwise = counterclockwise;
    }

}