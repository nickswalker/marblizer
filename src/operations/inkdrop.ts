import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import {Drop, InteractiveCurveRenderer} from "../renderer/curve_renderer.js";

export default class InkDropOperation implements Operation, VectorField {
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

    apply(renderer: InteractiveCurveRenderer) {
        let newDrop = new Drop(this.color, this.radius, this.position.x, this.position.y);
        if (this.displacing) {
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

        renderer.drops.push(newDrop);
    }


    atPoint(point: Vec2): Vec2 {
        const radius2 = Math.pow(this.radius, 2);
        const pointDir = point.sub(this.position);
        const factor = Math.sqrt(1 + (radius2 / Math.pow(pointDir.length(), 2)));

        const newPoint = this.position.add(pointDir.scale(factor));
        return newPoint.sub(point);

    }

}