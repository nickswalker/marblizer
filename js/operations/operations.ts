///<reference path="../models/color.ts"/>
///<reference path="../models/vector.ts"/>
abstract class Operation {
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

class InkDropOperation extends Operation {
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
}

class LineTineOperation extends Operation {
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
}