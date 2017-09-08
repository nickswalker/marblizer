///<reference path="../ui.ts"/>
class ColorPane {
    container: HTMLElement;
    foregroundPicker: HTMLInputElement;
    backgroundPicker: HTMLInputElement;
    swatches: Array<HTMLElement> = [];
    delegate: MarblingRendererDelegate;

    constructor(container: HTMLElement) {
        this.container = container;
        for (let i = 0; i < 5; i++) {
            const selector = ".swatch-" + i;
            const element = <HTMLElement>container.querySelector(selector);
            element.onclick = this.swatchClicked.bind(this);
            this.swatches.push(element);
        }

        window.addEventListener("change", function () {
            alert("test");
        });

        function installed() {
            this.foregroundPicker = <HTMLInputElement>container.querySelector(".foreground");
            this.backgroundPicker = <HTMLInputElement>container.querySelector(".background");
            this.foregroundPicker.onchange = this.foregroundChanged.bind(this);
            this.backgroundPicker.onchange = this.backgroundChanged.bind(this);
        }

        document.addEventListener("colorPickersInstalled", installed.bind(this));

        for (let i = 0; i < this.swatches.length; i++) {
            this.swatches[i].style.backgroundColor = colorSets[0][i].toRGBString();
        }


    }

    get currentColor() {
        return Color.withHex(this.foregroundPicker.value);
    }

    private foregroundChanged(event: Event, color) {
        let swatchColors = [];
        for (let i = 0; i < this.swatches.length; i++) {
            const current = Color.withRGB(this.swatches[i].style.backgroundColor);
            swatchColors.push(current);
        }
        this.swatches[0].style.backgroundColor = color.toRgbString();
        for (let i = 1; i < this.swatches.length; i++) {
            const current = swatchColors[i - 1];
            this.swatches[i].style.backgroundColor = current.toRGBString();
            swatchColors.push(current);
        }
    }

    private backgroundChanged(event: Event, color) {
        const parsed = Color.withRGB(color.toRgbString());
        this.delegate.applyOperations([new ChangeBaseColorOperation(parsed)]);
    }

    private swatchClicked(event: MouseEvent) {
        const target = <HTMLElement>event.target;
        const newColor = Color.withRGB(target.style.backgroundColor);
        $(this.foregroundPicker).spectrum("set", newColor.toHexString());
    }
}