enum Tool {
    Tine = 1,
    Drop = 2,
    Swirl = 3
}

interface MarblingUIDelegate {
    toolDidChange(tool: Tool)
    colorDidChange(color: Color)
    didRequestReset()
}

class MarblingUI {
    container: HTMLElement;
    tineButton: HTMLElement;
    dropButton: HTMLElement;
    swirlButton: HTMLElement;
    resetButton: HTMLElement;
    colorPicker: HTMLInputElement;
    currentTool: Tool;
    delegate?: MarblingUIDelegate;
    toolToButtonMapping: {[key: number]: HTMLElement};

    constructor(container: HTMLElement) {
        this.container = container;
        this.tineButton = <HTMLElement>container.querySelector(".tine-tool");
        this.dropButton = <HTMLElement>container.querySelector(".drop-tool");
        this.colorPicker = <HTMLInputElement>container.querySelector("input.color-picker");
        this.swirlButton = <HTMLElement>container.querySelector(".swirl-tool");
        this.resetButton = <HTMLElement>container.querySelector(".reset");
        this.tineButton.onclick = this.toolClicked.bind(this);
        this.dropButton.onclick = this.toolClicked.bind(this);
        this.swirlButton.onclick = this.toolClicked.bind(this);
        this.colorPicker.onchange = this.colorChanged.bind(this);

        this.resetButton.onclick = this.clickedReset.bind(this);
        this.toolToButtonMapping = {1: this.tineButton,
   2: this.dropButton,
    3: this.swirlButton};
    }

    private clickedReset(event: MouseEvent) {
        if (confirm("Are you sure you want to reset?")) {
            this.delegate.didRequestReset();
        }
    }

    private toolClicked(event: MouseEvent) {
        for (let key in this.toolToButtonMapping) {
            let newClasses = this.toolToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
            this.toolToButtonMapping[key].className = newClasses;
        }
        if (event.target == this.tineButton) {
            this.currentTool = Tool.Tine;
        } else if (event.target == this.dropButton) {
            this.currentTool = Tool.Drop;
        } else if (event.target == this.swirlButton) {
            this.currentTool = Tool.Swirl;
        }
        this.toolToButtonMapping[this.currentTool.valueOf()].className += " active";
        this.delegate.toolDidChange(this.currentTool);
    }

    private colorChanged(event: Event) {
        const newColor = MarblingUI.hexToRgb(this.colorPicker.value);
        this.delegate.colorDidChange(newColor);
    }

    private static hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);

            return new Color(r,g,b);
        }
        return null;
    }
}