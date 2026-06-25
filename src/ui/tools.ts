export enum Tool {
    Drop = 0,
    Spatter = 1,
    TineLine = 2,
    WavyLine = 3,
    CircularTine = 4,
    Vortex = 5
}

const allTools = [Tool.Drop, Tool.Spatter, Tool.TineLine, Tool.WavyLine, Tool.CircularTine, Tool.Vortex];

export type ToolParameterMap = { [key: string]: number };
type Guide = [number, number, number];

function toolInitializedObject<T>(): { [key: number]: T } {
    const object: { [key: number]: T } = {};
    for (const tool of allTools) {
        object[tool] = {} as T;
    }
    return object;
}

const parameterKeys: { [key: number]: string[] } = {};
parameterKeys[Tool.Drop] = ["radius"];
parameterKeys[Tool.Spatter] = ["scatterRadius", "dropRadius"];
parameterKeys[Tool.TineLine] = ["spacing", "numTines", "reach"];
parameterKeys[Tool.WavyLine] = ["spacing", "numTines", "reach"];
parameterKeys[Tool.CircularTine] = ["spacing", "numTines"];
parameterKeys[Tool.Vortex] = [];

export function parameterKeysFor(tool: Tool): string[] {
    return parameterKeys[tool] ?? [];
}

const guides: { [key: number]: { [key: string]: Guide } } = toolInitializedObject();
guides[Tool.Drop]["radius"] = [5, 300, 5];
guides[Tool.Spatter]["scatterRadius"] = [20, 300, 5];
guides[Tool.Spatter]["dropRadius"] = [5, 40, 5];
guides[Tool.TineLine]["spacing"] = [5, 300, 5];
guides[Tool.TineLine]["numTines"] = [0, 20, 1];
guides[Tool.TineLine]["reach"] = [20, 4000, 20];
guides[Tool.WavyLine]["spacing"] = [5, 300, 5];
guides[Tool.WavyLine]["numTines"] = [0, 20, 1];
guides[Tool.WavyLine]["reach"] = [20, 4000, 20];
guides[Tool.CircularTine]["spacing"] = [5, 300, 5];
guides[Tool.CircularTine]["numTines"] = [0, 20, 1];

export function guideFor(tool: Tool, key: string): Guide {
    return guides[tool][key];
}

const descriptions: { [key: string]: string } = {
    radius: "Size of the ink drop.",
    scatterRadius: "Radius of the area the spatter droplets scatter across.",
    dropRadius: "Size of each individual spatter droplet.",
    spacing: "Distance between each tine of the comb.",
    numTines: "Number of tines in the comb.",
    reach: "How far the effect reaches past the dragged segment before fading out.",
};

export function descriptionFor(key: string): string | undefined {
    return descriptions[key];
}


export default class ToolParameters {
    parameters: { [key: number]: ToolParameterMap };
    onchange: () => void;

    constructor(onchange: () => void) {
        this.onchange = onchange;
        this.parameters = toolInitializedObject();
        this.parameters[Tool.Drop]["radius"] = 50;
        this.parameters[Tool.Spatter]["scatterRadius"] = 100;
        this.parameters[Tool.Spatter]["dropRadius"] = 10;
        this.parameters[Tool.Spatter]["number"] = 100;
        this.parameters[Tool.Spatter]["variability"] = 20;
        this.parameters[Tool.TineLine]["numTines"] = 1;
        this.parameters[Tool.TineLine]["spacing"] = 200;
        this.parameters[Tool.TineLine]["reach"] = 4000;
        this.parameters[Tool.WavyLine]["numTines"] = 1;
        this.parameters[Tool.WavyLine]["spacing"] = 200;
        this.parameters[Tool.WavyLine]["reach"] = 4000;
        this.parameters[Tool.CircularTine]["numTines"] = 1;
        this.parameters[Tool.CircularTine]["spacing"] = 200;
    }

    forTool(tool: Tool): ToolParameterMap {
        return this.parameters[tool];
    }

    increase(tool: Tool, key: string) {
        const currentValue = this.parameters[tool][key];
        const [, max, step] = guides[tool][key];
        this.parameters[tool][key] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decrease(tool: Tool, key: string) {
        const currentValue = this.parameters[tool][key];
        const [min, , step] = guides[tool][key];
        this.parameters[tool][key] = Math.max(min, currentValue - step);
        this.onchange();
    }

}
