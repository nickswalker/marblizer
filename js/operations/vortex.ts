///<reference path="operations.ts"/>
class Vortex implements Operation, VectorField {
    // C in the paper
    readonly origin: Vec2;
    readonly numTines: number;
    readonly interval: number;
    readonly strength: number;
    readonly alpha = 80.0;
    readonly lambda = 32;
    private static regex = RegExp("//^v(?:ortex)? " + vec2Regex + floatRegex + "$/i");

    constructor(origin: Vec2, strength: number) {
        this.origin = origin;
        this.strength = strength
    }

    static fromString(str: string) {
        const match = Vortex.regex.exec(str);
        if (match != null && match.length > 0) {
            const origin = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const strength = parseFloat(match[2]);
            return new Vortex(origin, strength);
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
        const d = Math.abs(point.sub(this.origin).dot(this.normal));
        const factor = this.alpha * this.lambda / (d + this.lambda);
        return this.line.copy().scale(factor);
    }

}