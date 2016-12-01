///<reference path="../models/vector.ts"/>
///<reference path="../models/color.ts"/>
///<reference path="operations.ts"/>


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