///<reference path="../models/vector.ts"/>
///<reference path="operations.ts"/>
///<reference path="../ui/vector_field_overlay.ts"/>
class LineTine extends Operation implements VectorField {
    readonly direction: Vec2;
    readonly origin: Vec2;
    readonly numTines: number;
    readonly interval: number;
    private static regex = RegExp("//^l(?:ine)? " + vec2Regex + vec2Regex + floatRegex + floatRegex + "$/i");

    constructor(origin: Vec2, direction: Vec2, numTines: number, interval: number) {
        super();
        this.direction = direction;
        this.origin = origin;
        this.numTines = numTines;
        this.interval = interval;
    }

    static fromString(str: string) {
        const match = LineTine.regex.exec(str);
        if (match != null && match.length > 0) {
            const origin = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const direction = new Vec2(parseFloat(match[2]), parseFloat(match[3]));
            const numTines = parseFloat(match[4]);
            const interval = parseFloat(match[5]);
            return new LineTine(origin, direction, numTines, interval);
        }
    }

    apply(renderer: MarblingRenderer) {
        if (this.direction.length() < 0.001) {
            return;
        }

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
        const unitLine = this.direction.norm();
        const alpha = 80.0;
        const lambda = 32;
        // Unit normal to the tine line
        const norm = this.direction.perp().norm();
        const d = point.sub(this.origin).dot(norm).length();
        return unitLine.copy().scale(alpha * lambda / (d + lambda));
    }

}