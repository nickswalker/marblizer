class ColorPane {
    container: HTMLElement;
    colorPicker: HTMLInputElement;
    nextColorSetButton: HTMLElement;
    swatches: Array<HTMLElement> = [];
    delegate: MarblingUIDelegate;
    private colorSetIndex = 0;

    constructor(container: HTMLElement) {
        this.container = container;
        this.colorPicker = <HTMLInputElement>container.querySelector("input.color-picker");
        this.nextColorSetButton = <HTMLElement>container.querySelector(".next-color-set");
        for (let i = 0; i < 5; i++) {
            const selector = ".swatch-" + i;
            const element = <HTMLElement>container.querySelector(selector);
            element.onclick = this.swatchClicked.bind(this);
            this.swatches.push(element);
        }

        this.colorPicker.onchange = this.colorChanged.bind(this);
        this.nextColorSetButton.onclick = this.cycleColorSet.bind(this);
        this.colorSetIndex -= 1;
        this.cycleColorSet();

    }

    private colorChanged(event: Event) {
        const newColor = Color.withHex(this.colorPicker.value);
    }

    private swatchClicked(event: MouseEvent) {
        const target = <HTMLElement>event.target;
        const newColor = Color.withRGB(target.style.backgroundColor);
        this.colorPicker.value = newColor.toHexString();
    }

    private cycleColorSet() {
        this.colorSetIndex += 1;
        this.colorSetIndex %= colorSets.length;
        const currentSet = colorSets[this.colorSetIndex];
        for (let i = 0; i < 5; i++) {
            this.swatches[i].style.backgroundColor = currentSet[i].toRGBString();
        }

    }

    get currentColor() {
        return Color.withHex(this.colorPicker.value);
    }
}

enum Tool {
    Drop = 0,
    TineLine = 1,
    WavyLine = 2,
    CircularTine = 3,
    Vortex = 4
}

class ToolsPane {
    container: HTMLElement;
    resetButton: HTMLElement;
    toolToButtonMapping: {[key: number]: HTMLElement};
    delegate: MarblingUIDelegate;
    private _currentTool: Tool;
    toolParameters: {[key: number]: Object};

    constructor(container: HTMLElement) {
        this.container = container;
        const dropButton = <HTMLElement>container.querySelector(".drop-tool");
        const tineButton = <HTMLElement>container.querySelector(".tine-tool");
        const wavyButton = <HTMLElement>container.querySelector(".wavy-tine-tool");
        const circularButton = <HTMLElement>container.querySelector(".circular-tine-tool");
        const swirlButton = <HTMLElement>container.querySelector(".vortex-tool");

        this.toolToButtonMapping = {};
        this.toolToButtonMapping[Tool.Drop] = dropButton;
        this.toolToButtonMapping[Tool.TineLine] = tineButton;
        this.toolToButtonMapping[Tool.WavyLine] = wavyButton;
        this.toolToButtonMapping[Tool.CircularTine] = circularButton;
        this.toolToButtonMapping[Tool.Vortex] = swirlButton;
        this.toolParameters = {};
        this.toolParameters[Tool.Drop] = {};
        this.toolParameters[Tool.Drop]["radius"] = 50;

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

    increaseToolParameter(tool: Tool) {
        switch (this.currentTool) {
            case Tool.Drop:
                const current = this.toolParameters[tool]["radius"];
                this.toolParameters[tool]["radius"] = Math.min(100, current + 5);
        }

        this.fireEvent();
    }

    decreaseToolParameter(tool: Tool) {
        switch (this.currentTool) {
            case Tool.Drop:
                const current = this.toolParameters[tool]["radius"];
                this.toolParameters[tool]["radius"] = Math.max(current - 5, 5);
        }
        this.fireEvent();
    }

    private fireEvent() {
        const dict = {"currentTool": this.currentTool, "parameters": this.toolParameters[this.currentTool]};
        const event = new CustomEvent("toolchange", {detail: dict});
        document.dispatchEvent(event);
    }
}

class TextInputPane {
    element: HTMLElement;
    callback: Function;
    active: boolean;
    private textArea: HTMLTextAreaElement;
    private confirmButton: HTMLElement;
    private dismissButton: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.textArea = <HTMLTextAreaElement>element.querySelector("textarea");
        this.dismissButton = <HTMLElement>element.querySelector(".cancel");
        this.confirmButton = <HTMLElement>element.querySelector(".confirm");

        this.confirmButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
    }

    getInput(callback: Function) {
        this.callback = callback;
        this.show();
    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(this.textArea.value);
    }

    private didClickDismiss(event: MouseEvent) {
        this.hide();
        this.callback("");
    }

    hide() {
        this.active = false;
        this.element.style.visibility = "hidden";
    }

    show() {
        this.active = true;
        this.element.style.visibility = "initial";
    }
}