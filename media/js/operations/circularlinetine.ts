///<reference path="../models/vector.ts"/>
///<reference path="color_operations.ts"/>
///<reference path="../ui/vector_field_overlay.ts"/>
///<reference path="../renderer/curve_renderer.ts"/>
///<reference path="../models/matrix.ts"/>
class CircularLineTine implements Operation, VectorField {
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
        const d = Math.abs(pLessCLen - this.radius);
        const l = this.alpha * this.lambda / (d + this.lambda);
        const theta = this.counterClockwise ? -l / pLessCLen : l / pLessCLen;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
        const addend = pLessC.mult(mat);
        const trans = this.center.add(addend);
        return trans.sub(point);
    }

}