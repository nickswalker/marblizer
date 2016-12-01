///<reference path="vector.ts"/>
///<reference path="color.ts"/>
abstract class Operation {

}
const positiveFloatRegex = "(\\d*(?:\\.\\d+)?)";
const floatRegex = "(-?\\d*(?:\\.\\d+)?)";
const colorRegex = "(#?[A-Fa-f\\d]{2}[A-Fa-f\\d]{2}[A-Fa-f\\d]{2})";
const vec2Regex = "\\(" + floatRegex + ",\\s*" + floatRegex + "\\)";


class ChangeInkColorOperation {

}

class ChangeBaseColorOperation {

}

class InkDropOperation extends Operation {
    position: Vec2;
    radius: number;
    color: Color;
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

class OperationsParser {
    static allOperationParsers = [InkDropOperation.fromString];

    static parse(string: string) {
        const lines = string.split("\n");
        let parsed = [];
        for (let i = 0; i < lines.length; i++) {
            const result = OperationsParser.parseLine(string);
            if (result == null) {
                alert("Failed to parse line " + i);
                return;
            }
            parsed.push(result);
        }
        return parsed;
    }

    private static parseLine(line: string) {
        for (let i = 0; i < this.allOperationParsers.length; i++) {
            const result = this.allOperationParsers[i](line);
            if (result != null) {
                return result;
            }
        }
    }
}