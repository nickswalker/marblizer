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

class ChangeBaseColorOperation extends Operation {
    private static regex = RegExp("//^b(?:ase)?" + colorRegex + "$/i");
    readonly color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    static fromString(str: string) {
        const match = ChangeBaseColorOperation.regex.exec(str);
        if (match != null && match.length > 0) {
            const color = Color.withRGB(match[0]);
            return new ChangeBaseColorOperation(color);
        }
    }

    apply(renderer: MarblingRenderer) {
        renderer.baseColor = this.color;
    }
}

