import Operation from "../operations/color_operations.js";
import MarblingRenderer from "./curve_renderer.js";

export default class SVGRenderer implements MarblingRenderer {
    private history: Operation[] = [];

    save() {
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
