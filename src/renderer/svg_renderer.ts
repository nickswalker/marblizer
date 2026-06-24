import Color from "../models/color.js";
import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import MarblingRenderer from "./curve_renderer.js";

export default class SVGRenderer implements MarblingRenderer {
    private history: Operation[] = [];

    save() {
    }

    getColorsAt(points: Vec2[]): Promise<(Color | null)[]> {
        return Promise.resolve(points.map(() => null));
    }

    reset() {
        this.history = [];
    }

    setSize(width: number, height: number) {
    }

    getHistory(): Operation[] {
        return this.history;
    }

    applyOperations(operations: Operation[]) {
    }

}
