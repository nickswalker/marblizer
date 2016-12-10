///<reference path="../ui.ts"/>
///<reference path="../tools.ts"/>

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