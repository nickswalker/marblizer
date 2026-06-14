import Operation, {Displacement, InkDeposit} from "./color_operations.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import Mat2x2 from "../models/matrix.js";

export default class Vortex implements Operation, Displacement {
    // C in the paper
    readonly center: Vec2;
    readonly radius: number;
    readonly strength: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    readonly counterclockwise: boolean;
    readonly deposit: InkDeposit | null = null;
    readonly newBaseColor: Color | null = null;

    constructor(origin: Vec2, radius: number, counterclockwise: boolean = false) {
        this.center = origin;
        this.radius = radius;
        this.counterclockwise = counterclockwise;
    }

    get displacement(): Displacement {
        return this;
    }

    atPoint(point: Vec2): Vec2 {
        return this.rotate(point, 1);
    }

    // Rotation preserves distance to the centre, so undoing it is just a
    // rotation by the negated angle at the same radius.
    inverseAtPoint(point: Vec2): Vec2 {
        return this.rotate(point, -1);
    }

    private rotate(point: Vec2, sign: number): Vec2 {
        const pLessC = point.sub(this.center);
        const pLessCLen = pLessC.length();
        const d = Math.abs(100 / this.radius * pLessCLen);
        const l = this.alpha * this.lambda / (d + this.lambda);
        const theta = sign * (this.counterclockwise ? -l / pLessCLen : l / pLessCLen);
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
        const addend = pLessC.mult(mat);
        const trans = this.center.add(addend);
        return trans.sub(point);
    }
}
