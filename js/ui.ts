
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
        for(let i = 0; i < 5; i++) {
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
        for(let i = 0; i < 5; i++) {
            this.swatches[i].style.backgroundColor = currentSet[i].toRGBString();
        }

    }
}

enum Tool {
    Tine = 1,
    Drop = 2,
    Swirl = 3
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

        this.toolToButtonMapping = {1: tineButton,
            2: dropButton,
            3: swirlButton};
        for (let key in this.toolToButtonMapping) {
            this.toolToButtonMapping[key].onclick = this.toolClicked.bind(this);
        }
        
        this.resetButton = <HTMLElement>container.querySelector(".reset");
        this.resetButton.onclick = this.clickedReset.bind(this);
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

interface MarblingUIDelegate {
    toolDidChange(tool: Tool)
    colorDidChange(color: Color)
    didRequestReset()
}

class MarblingUI {
    toolsPane: ToolsPane;
    colorPane: ColorPane;
    _delegate: MarblingUIDelegate;

    constructor(toolsContainer: HTMLElement, colorContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
    }

    set delegate(delegate: MarblingUIDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
    }

}