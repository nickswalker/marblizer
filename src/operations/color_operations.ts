import Color from "../models/color.js";
import {InteractiveCurveRenderer} from "../renderer/curve_renderer.js";

export default interface Operation {
    apply(renderer: InteractiveCurveRenderer);
}

export class ChangeBaseColorOperation implements Operation {
    readonly color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    apply(renderer: InteractiveCurveRenderer) {
        renderer.baseColor = this.color;
    }
}

