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
        this.delegate.colorDidChange(newColor);
    }

    private swatchClicked(event: MouseEvent) {
        const target = <HTMLElement>event.target;
        const newColor = Color.withRGB(target.style.backgroundColor);
        this.colorPicker.value = newColor.toHexString();
        this.delegate.colorDidChange(newColor);
    }

    private cycleColorSet() {
        this.colorSetIndex += 1;
        this.colorSetIndex %= colorSets.length;
        const currentSet = colorSets[this.colorSetIndex];
        for (let i = 0; i < 5; i++) {
            this.swatches[i].style.backgroundColor = currentSet[i].toRGBString();
        }

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
    currentTool: Tool;

    constructor(container: HTMLElement) {
        this.container = container;
        const tineButton = <HTMLElement>container.querySelector(".tine-tool");
        const dropButton = <HTMLElement>container.querySelector(".drop-tool");
        const swirlButton = <HTMLElement>container.querySelector(".swirl-tool");

        this.toolToButtonMapping = {};
        this.toolToButtonMapping[Tool.Drop] = dropButton;
        this.toolToButtonMapping[Tool.TineLine] = tineButton;
        this.toolToButtonMapping[Tool.Vortex] = swirlButton;

        this.resetButton = <HTMLElement>container.querySelector(".reset");
        this.resetButton.onclick = this.clickedReset.bind(this);

        // Set default tool
        this.currentTool = Tool.Drop;
        this.toolToButtonMapping[this.currentTool.valueOf()].className += " active";
    }


    private toolClicked(event: MouseEvent) {
        for (let key in this.toolToButtonMapping) {
            let newClasses = this.toolToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
            this.toolToButtonMapping[key].className = newClasses;
        }
        const target = event.target;
        for (let key in this.toolToButtonMapping) {
            if (this.toolToButtonMapping[key] == target) {
                this.currentTool = <Tool>parseInt(key);
            }
        }

        this.toolToButtonMapping[this.currentTool.valueOf()].className += " active";
        this.delegate.toolDidChange(this.currentTool);
    }

    private clickedReset(event: MouseEvent) {
        if (confirm("Are you sure you want to reset?")) {
            this.delegate.didRequestReset();
        }
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