import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import {Drop, InteractiveCurveRenderer} from "../renderer/curve_renderer.js";

export default class InkDropOperation implements Operation {
    readonly position: Vec2;
    readonly radius: number;
    readonly color: Color;
    readonly displacing: boolean;

    constructor(position: Vec2, radius: number, color: Color, displacing: boolean = true) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.displacing = displacing;
    }
}

