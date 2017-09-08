///<reference path="panes/toolspane.ts"/>
enum Tool {
    Drop = 0,
    Spatter = 1,
    TineLine = 2,
    WavyLine = 3,
    CircularTine = 4,
    Vortex = 5
}

const allTools = [Tool.Drop, Tool.Spatter, Tool.TineLine, Tool.WavyLine, Tool.CircularTine, Tool.Vortex];

function toolInitializedObject(): { [key: number]: Object } {
    const object = {};
    for (const tool in allTools) {
        object[tool] = {};
    }
    return object;
}

const primaryKeys = toolInitializedObject();
primaryKeys[Tool.Drop] = "radius";
primaryKeys[Tool.Spatter] = "scatterRadius";
primaryKeys[Tool.TineLine] = "spacing";
primaryKeys[Tool.WavyLine] = "spacing";
primaryKeys[Tool.CircularTine] = "spacing";

const secondaryKeys = toolInitializedObject();
secondaryKeys[Tool.Spatter] = "dropRadius";
secondaryKeys[Tool.TineLine] = "numTines";
secondaryKeys[Tool.CircularTine] = "numTines";

const guides = toolInitializedObject();
guides[Tool.Drop]["radius"] = [5, 300, 5];
guides[Tool.Spatter]["scatterRadius"] = [20, 300, 5];
guides[Tool.Spatter]["dropRadius"] = [5, 40, 5];
guides[Tool.TineLine]["spacing"] = [5, 300, 5];
guides[Tool.TineLine]["numTines"] = [0, 20, 1];
guides[Tool.WavyLine]["spacing"] = [5, 300, 5];
guides[Tool.WavyLine]["numTines"] = [0, 20, 1];
guides[Tool.CircularTine]["spacing"] = [5, 300, 5];
guides[Tool.CircularTine]["numTines"] = [0, 20, 1];


class ToolParameters {
    parameters: { [key: number]: Object };
    onchange: Function;

    constructor(onchange: Function) {
        this.onchange = onchange;
        this.parameters = toolInitializedObject();
        this.parameters[Tool.Drop]["radius"] = 50;
        this.parameters[Tool.Spatter]["scatterRadius"] = 100;
        this.parameters[Tool.Spatter]["dropRadius"] = 10;
        this.parameters[Tool.Spatter]["number"] = 100;
        this.parameters[Tool.Spatter]["variability"] = 20;
        this.parameters[Tool.TineLine]["numTines"] = 1;
        this.parameters[Tool.TineLine]["spacing"] = 200;
        this.parameters[Tool.WavyLine]["numTines"] = 1;
        this.parameters[Tool.WavyLine]["spacing"] = 200;
        this.parameters[Tool.CircularTine]["numTines"] = 1;
        this.parameters[Tool.CircularTine]["spacing"] = 200;
    }

    forTool(tool: Tool) {
        return this.parameters[tool];
    }

    increasePrimary(tool: Tool) {
        const currentValue = this.parameters[tool][primaryKeys[tool]];
        const [min, max, step] = guides[tool][primaryKeys[tool]];
        this.parameters[tool][primaryKeys[tool]] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreasePrimary(tool: Tool) {
        const currentValue = this.parameters[tool][primaryKeys[tool]];
        const [min, max, step] = guides[tool][primaryKeys[tool]];
        this.parameters[tool][primaryKeys[tool]] = Math.max(min, currentValue - step);
        this.onchange();
    }

    increaseSecondary(tool: Tool) {
        const currentValue = this.parameters[tool][secondaryKeys[tool]];
        const [min, max, step] = guides[tool][secondaryKeys[tool]];
        this.parameters[tool][secondaryKeys[tool]] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreaseSecondary(tool: Tool) {
        const currentValue = this.parameters[tool][secondaryKeys[tool]];
        const [min, max, step] = guides[tool][secondaryKeys[tool]];
        this.parameters[tool][secondaryKeys[tool]] = Math.max(min, currentValue - step);
        this.onchange();
    }

}