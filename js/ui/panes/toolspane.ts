///<reference path="../ui.ts"/>
enum Tool {
    Drop = 0,
    Spatter = 1,
    TineLine = 2,
    WavyLine = 3,
    CircularTine = 4,
    Vortex = 5
}

const allTools = [Tool.Drop, Tool.Spatter, Tool.TineLine, Tool.WavyLine, Tool.CircularTine, Tool.Vortex];

const primaryKeys = {};
for (const tool in allTools) {
    primaryKeys[tool] = {};
}
primaryKeys[Tool.Drop] = "radius";
primaryKeys[Tool.Spatter] = "radius";
primaryKeys[Tool.TineLine] = "spacing";

const guides = {};
for (const tool in allTools) {
    guides[tool] = {};
}
guides[Tool.Drop]["radius"] = [5, 100, 5];
guides[Tool.Spatter]["radius"] = [20, 300, 5];
guides[Tool.TineLine]["spacing"] = [5, 300, 5];
guides[Tool.TineLine]["numTines"] = [0, 20, 1];

const secondaryKeys = {};
for (const tool in allTools) {
    secondaryKeys[tool] = {};
}
secondaryKeys[Tool.Spatter] = "variability";
secondaryKeys[Tool.TineLine] = "numTines";


class ToolParameters {
    parameters: {[key: number]: Object};
    onchange: Function;

    constructor(onchange: Function) {
        this.onchange = onchange;
        this.parameters = {};
        this.parameters[Tool.Drop] = {};
        this.parameters[Tool.Drop]["radius"] = 50;
        this.parameters[Tool.Spatter] = {};
        this.parameters[Tool.Spatter]["radius"] = 100;
        this.parameters[Tool.Spatter]["number"] = 100;
        this.parameters[Tool.Spatter]["variability"] = 20;
        this.parameters[Tool.TineLine] = {};
        this.parameters[Tool.TineLine]["numTines"] = 1;
        this.parameters[Tool.TineLine]["spacing"] = 200;
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

class ToolsPane {
    container: HTMLElement;
    resetButton: HTMLElement;
    toolToButtonMapping: {[key: number]: HTMLElement};
    delegate: MarblingUIDelegate;
    private _currentTool: Tool;
    toolParameters: ToolParameters;

    constructor(container: HTMLElement) {
        this.container = container;
        const dropButton = <HTMLElement>container.querySelector(".drop-tool");
        const spatterButton = <HTMLElement>container.querySelector(".spatter-tool");
        const tineButton = <HTMLElement>container.querySelector(".tine-tool");
        const wavyButton = <HTMLElement>container.querySelector(".wavy-tine-tool");
        const circularButton = <HTMLElement>container.querySelector(".circular-tine-tool");
        const swirlButton = <HTMLElement>container.querySelector(".vortex-tool");

        this.toolToButtonMapping = {};
        this.toolToButtonMapping[Tool.Drop] = dropButton;
        this.toolToButtonMapping[Tool.Spatter] = spatterButton;
        this.toolToButtonMapping[Tool.TineLine] = tineButton;
        this.toolToButtonMapping[Tool.WavyLine] = wavyButton;
        this.toolToButtonMapping[Tool.CircularTine] = circularButton;
        this.toolToButtonMapping[Tool.Vortex] = swirlButton;

        this.toolParameters = new ToolParameters(this.fireEvent.bind(this));

        this.resetButton = <HTMLElement>container.querySelector(".reset");
        this.resetButton.onclick = this.clickedReset.bind(this);

        // Set default tool
        this._currentTool = Tool.Drop;
        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        for (const key in this.toolToButtonMapping) {
            this.toolToButtonMapping[key].onclick = this.toolClicked.bind(this);
        }
    }


    private toolClicked(event: MouseEvent) {
        for (let key in this.toolToButtonMapping) {
            let newClasses = this.toolToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
            this.toolToButtonMapping[key].className = newClasses;
        }
        const target = event.target;
        for (let key in this.toolToButtonMapping) {
            if (this.toolToButtonMapping[key] == target) {
                this._currentTool = <Tool>parseInt(key);
            }
        }

        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        this.fireEvent();
    }

    private clickedReset(event: MouseEvent) {
        if (confirm("Are you sure you want to reset?")) {
            this.delegate.reset();
        }
    }

    get currentTool(): Tool {
        return this._currentTool;
    }

    set currentTool(value: Tool) {
        this._currentTool = value;
        this.fireEvent()
    }

    private fireEvent() {
        const dict = {"currentTool": this.currentTool, "parameters": this.toolParameters.forTool(this.currentTool)};
        const event = new CustomEvent("toolchange", {detail: dict});
        document.dispatchEvent(event);
    }

}