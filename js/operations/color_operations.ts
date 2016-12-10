///<reference path="../models/color.ts"/>
///<reference path="../models/vector.ts"/>
///<reference path="../marbling_renderer.ts"/>
interface Operation {
    apply(renderer: MarblingRenderer);
}

class ChangeBaseColorOperation implements Operation {
    readonly color: Color;

    constructor(color: Color) {
        this.color = color;
    }

    apply(renderer: MarblingRenderer) {
        renderer.baseColor = this.color;
    }
}

