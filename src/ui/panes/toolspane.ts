import {MarblingRendererDelegate} from "../ui.js";
import ToolParameters, {Tool} from "../tools.js";

export default class ToolsPane {
    container: HTMLElement;
    toolToButtonMapping: { [key: number]: HTMLElement };
    delegate: MarblingRendererDelegate;
    toolParameters: ToolParameters;
    private shiftDown: boolean = false;

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

        // Set default tool
        this._currentTool = Tool.Drop;
        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        for (const key in this.toolToButtonMapping) {
            this.toolToButtonMapping[key].onclick = this.toolClicked.bind(this);
        }
        document.addEventListener("keydown", this.shiftChange.bind(this));
        document.addEventListener("keyup", this.shiftChange.bind(this));
    }

    private _currentTool: Tool;

    get currentTool(): Tool {
        return this._currentTool;
    }

    set currentTool(value: Tool) {
        this._currentTool = value;
        this.fireEvent()
    }

    private shiftChange(e: KeyboardEvent) {
        this.shiftDown = e.shiftKey;
    }

    private toolClicked(event: MouseEvent) {
        for (let key in this.toolToButtonMapping) {
            let newClasses = this.toolToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
            this.toolToButtonMapping[key].className = newClasses;
        }
        const target = event.currentTarget;
        for (let key in this.toolToButtonMapping) {
            if (this.toolToButtonMapping[key] == target) {
                this._currentTool = <Tool>parseInt(key);
            }
        }

        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        this.fireEvent();
    }

    private fireEvent() {
        const dict = {"currentTool": this.currentTool, "parameters": this.toolParameters.forTool(this.currentTool)};
        const event = new CustomEvent("toolchange", {detail: dict});
        document.dispatchEvent(event);
    }

}