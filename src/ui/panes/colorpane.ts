import {MarblingRendererDelegate} from "../ui.js";
import {default as Color, colorSets} from "../../models/color.js";
import {ChangeBaseColorOperation} from "../../operations/color_operations.js";

export default class ColorPane {
    container: HTMLElement;
    foregroundPicker: HTMLInputElement;
    backgroundPicker: HTMLInputElement;
    swatches: Array<HTMLElement> = [];
    delegate!: MarblingRendererDelegate;
    private recentColors: Color[] = [];

    constructor(container: HTMLElement) {
        this.container = container;
        this.foregroundPicker = <HTMLInputElement>container.querySelector(".foreground")!;
        this.backgroundPicker = <HTMLInputElement>container.querySelector(".background")!;
        this.foregroundPicker.addEventListener("change", this.foregroundChanged.bind(this));
        this.backgroundPicker.addEventListener("change", this.backgroundChanged.bind(this));

        for (let i = 0; i < 5; i++) {
            const selector = ".swatch-" + i;
            const element = <HTMLElement>container.querySelector(selector)!;
            element.onclick = this.swatchClicked.bind(this);
            this.swatches.push(element);
        }

        this.recentColors = colorSets[0].slice(0, this.swatches.length);
        this.renderRecentColors();


    }

    get currentColor(): Color {
        return Color.withHex(this.foregroundPicker.value)!;
    }

    get backgroundColor(): Color {
        return Color.withHex(this.backgroundPicker.value)!;
    }

    private foregroundChanged(event: Event) {
        const picker = <HTMLInputElement>event.target;
        this.pushRecentColor(picker.value);
    }

    private pushRecentColor(hex: string) {
        const color = Color.withHex(hex);
        if (color == null) {
            return;
        }
        const hexColor = color.toHexString();
        this.recentColors = [
            color,
            ...this.recentColors.filter((recent) => recent.toHexString() !== hexColor),
        ].slice(0, this.swatches.length);
        this.renderRecentColors();
    }

    private renderRecentColors() {
        for (let i = 0; i < this.swatches.length; i++) {
            const color = this.recentColors[i];
            if (color != null) {
                this.swatches[i].style.backgroundColor = color.toRGBString();
            }
        }
    }

    private backgroundChanged(event: Event) {
        const picker = <HTMLInputElement>event.target;
        const parsed = Color.withHex(picker.value);
        if (parsed != null) {
            this.delegate.applyOperations([new ChangeBaseColorOperation(parsed)]);
        }
    }

    private swatchClicked(event: MouseEvent) {
        const target = <HTMLElement>event.target;
        const hexColor = this.recentColors[this.swatches.indexOf(target)]?.toHexString();
        if (hexColor != null) {
            this.foregroundPicker.value = hexColor;
            this.pushRecentColor(hexColor);
        }
    }
}
