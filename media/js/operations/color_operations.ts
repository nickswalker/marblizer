///<reference path="../models/color.ts"/>
///<reference path="../models/vector.ts"/>
///<reference path="../renderer/curve_renderer.ts"/>
interface Operation {
    apply(renderer: InteractiveCurveRenderer);
}

class ChangeBaseColorOperation implements Operation {
    readonly color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    apply(renderer: InteractiveCurveRenderer) {
        renderer.baseColor = this.color;
    }
}

