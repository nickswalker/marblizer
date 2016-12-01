///<reference path="../models/color.ts"/>
///<reference path="../models/vector.ts"/>
abstract class Operation {
    abstract apply(renderer: MarblingRenderer);
}

const positiveFloatRegex = "(\\d*(?:\\.\\d+)?)";
const floatRegex = "(-?\\d*(?:\\.\\d+)?)";
const colorRegex = "(#?[A-Fa-f\\d]{2}[A-Fa-f\\d]{2}[A-Fa-f\\d]{2})";
const vec2Regex = "\\(" + floatRegex + ",\\s*" + floatRegex + "\\)";


class ChangeInkColorOperation {
    private static regex = RegExp("//^i(?:nk)?" + colorRegex + "$/i");
    readonly color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    static fromString(str: string) {
        const match = ChangeInkColorOperation.regex.exec(str);
        if (match != null && match.length > 0) {
            const color = Color.withRGB(match[0]);
            return new ChangeBaseColorOperation(color);
        }
    }

    apply(renderer: MarblingRenderer) {

    }
}

class ChangeBaseColorOperation {
    private static regex = RegExp("//^b(?:ase)?" + colorRegex + "$/i");
    readonly color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    static fromString(str: string) {
        const match = ChangeBaseColorOperation.regex.exec(str);
        if (match != null && match.length > 0) {
            const color = Color.withRGB(match[0]);
            return new ChangeBaseColorOperation(color);
        }
    }
}

class InkDropOperation extends Operation implements VectorField {
    readonly position: Vec2;
    readonly radius: number;
    readonly color: Color;
    private static regex = RegExp("//^d(?:rop)? " + vec2Regex + positiveFloatRegex + colorRegex + "$/i");

    constructor(position: Vec2, radius: number, color: Color) {
        super();
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    static fromString(str: string) {
        const match = InkDropOperation.regex.exec(str);
        if (match != null && match.length > 0) {
            const position = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const radius = parseFloat(match[1]);
            const color = Color.withHex(match[2]);
            return new InkDropOperation(position, radius, color);
        }
    }

    apply(renderer: MarblingRenderer) {
        let newDrop = new Drop(this.color, this.radius, this.position.x, this.position.y);

        for (let d = 0; d < renderer.drops.length; d++) {
            let drop = renderer.drops[d];
            for (let p = 0; p < drop.points.length; p++) {
                const oldPoint = drop.points[p];
                const offset = this.atPoint(oldPoint);
                drop.points[p] = oldPoint.add(offset);
            }
            drop.makeDirty();
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

class LineTineOperation extends Operation implements VectorField {
    readonly direction: Vec2;
    readonly origin: Vec2;
    readonly numTines: number;
    readonly interval: number;
    private static regex = RegExp("//^d(?:rop)? " + vec2Regex + vec2Regex + floatRegex + floatRegex + "$/i");

    constructor(origin: Vec2, direction: Vec2, numTines: number, interval: number) {
        super();
        this.direction = direction;
        this.origin = origin;
        this.numTines = numTines;
        this.interval = interval;
    }

    static fromString(str: string) {
        const match = LineTineOperation.regex.exec(str);
        if (match != null && match.length > 0) {
            const origin = new Vec2(parseFloat(match[0]), parseFloat(match[1]));
            const direction = new Vec2(parseFloat(match[2]), parseFloat(match[3]));
            const numTines = parseFloat(match[4]);
            const interval = parseFloat(match[5]);
            return new LineTineOperation(origin, direction, numTines, interval);
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
        const u = Math.pow(0.5, 1.0 / 8.0);
        const z = 20.0;
        // Unit normal to the tine line
        const norm = this.direction.perp().norm();
        const d = point.sub(this.origin).dot(norm).length();
        return unitLine.copy().scale(z * Math.pow(u, d));
    }

}