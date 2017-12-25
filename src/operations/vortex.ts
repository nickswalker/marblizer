import Operation from "./color_operations.js";
import VectorField from "../models/vectorfield.js";
import Vec2 from "../models/vector.js";
import {InteractiveCurveRenderer} from "../renderer/curve_renderer.js";
import Mat2x2 from "../models/matrix.js";

export default class Vortex implements Operation, VectorField {
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
        const pLessC = point.sub(this.center);
        const pLessCLen = pLessC.length();
        const d = Math.abs(100 / this.radius * pLessCLen);
        const l = this.alpha * this.lambda / (d + this.lambda);
        const theta = this.counterclockwise ? -l / pLessCLen : l / pLessCLen;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
        const addend = pLessC.mult(mat);
        const trans = this.center.add(addend);
        return trans.sub(point);
    }

}