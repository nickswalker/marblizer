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

const primaryKeys: { [key: number]: string } = {};
primaryKeys[Tool.Drop] = "radius";
primaryKeys[Tool.Spatter] = "scatterRadius";
primaryKeys[Tool.TineLine] = "spacing";
primaryKeys[Tool.WavyLine] = "spacing";
primaryKeys[Tool.CircularTine] = "spacing";

const secondaryKeys: { [key: number]: string } = {};
secondaryKeys[Tool.Spatter] = "dropRadius";
secondaryKeys[Tool.TineLine] = "numTines";
secondaryKeys[Tool.CircularTine] = "numTines";

export function primaryKeyFor(tool: Tool): string | undefined {
    return primaryKeys[tool];
}

export function secondaryKeyFor(tool: Tool): string | undefined {
    return secondaryKeys[tool];
}

const guides: { [key: number]: { [key: string]: Guide } } = toolInitializedObject();
guides[Tool.Drop]["radius"] = [5, 300, 5];
guides[Tool.Spatter]["scatterRadius"] = [20, 300, 5];
guides[Tool.Spatter]["dropRadius"] = [5, 40, 5];
guides[Tool.TineLine]["spacing"] = [5, 300, 5];
guides[Tool.TineLine]["numTines"] = [0, 20, 1];
guides[Tool.WavyLine]["spacing"] = [5, 300, 5];
guides[Tool.WavyLine]["numTines"] = [0, 20, 1];
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
        this.parameters[Tool.WavyLine]["numTines"] = 1;
        this.parameters[Tool.WavyLine]["spacing"] = 200;
        this.parameters[Tool.CircularTine]["numTines"] = 1;
        this.parameters[Tool.CircularTine]["spacing"] = 200;
    }

    forTool(tool: Tool): ToolParameterMap {
        return this.parameters[tool];
    }

    increasePrimary(tool: Tool) {
        const key = primaryKeys[tool];
        if (key == null) {
            return;
        }
        const currentValue = this.parameters[tool][key];
        const [, max, step] = guides[tool][key];
        this.parameters[tool][key] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreasePrimary(tool: Tool) {
        const key = primaryKeys[tool];
        if (key == null) {
            return;
        }
        const currentValue = this.parameters[tool][key];
        const [min, , step] = guides[tool][key];
        this.parameters[tool][key] = Math.max(min, currentValue - step);
        this.onchange();
    }

    increaseSecondary(tool: Tool) {
        const key = secondaryKeys[tool];
        if (key == null) {
            return;
        }
        const currentValue = this.parameters[tool][key];
        const [, max, step] = guides[tool][key];
        this.parameters[tool][key] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreaseSecondary(tool: Tool) {
        const key = secondaryKeys[tool];
        if (key == null) {
            return;
        }
        const currentValue = this.parameters[tool][key];
        const [min, , step] = guides[tool][key];
        this.parameters[tool][key] = Math.max(min, currentValue - step);
        this.onchange();
    }

}
