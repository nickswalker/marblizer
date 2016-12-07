///<reference path="../ui.ts"/>
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