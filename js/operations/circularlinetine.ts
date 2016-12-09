///<reference path="../models/vector.ts"/>
///<reference path="operations.ts"/>
///<reference path="../ui/vector_field_overlay.ts"/>
///<reference path="../marbling_renderer.ts"/>
///<reference path="../models/matrix.ts"/>
class CircularLineTine extends Operation implements VectorField {
    // C in the paper
    readonly center: Vec2;
    readonly radius: number;
    readonly numTines: number;
    readonly interval: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    private static regex = RegExp("//^c(?:ircle)? " + vec2Regex + vec2Regex + floatRegex + floatRegex + "$/i");

    constructor(origin: Vec2, radius: number, numTines: number, interval: number) {
        super();
        this.radius = radius;
        this.center = origin;
        this.numTines = numTines;
        this.interval = interval;
    }

    static fromString(str: string) {
        const match = CircularLineTine.regex.exec(str);
        if (match != null && match.length > 0) {
            const origin = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const direction = new Vec2(parseFloat(match[2]), parseFloat(match[3]));
            const numTines = parseFloat(match[4]);
            const interval = parseFloat(match[5]);
            return new CircularLineTine(origin, numTines, interval);
        }
    }

    apply(renderer: MarblingRenderer) {
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
        const theta = l / pLessCLen;
        const mat = new Mat2x2(Math.cos(theta), Math.sin(theta), -Math.sin(theta), Math.cos(theta));
        const trans = this.center.add(pLessC.mult(mat));
        return trans.sub(point);
    }

}