import Color from "../models/color.js";
import Operation from "../operations/color_operations.js";
import {CurveField} from "./curve_field.js";

export {Drop} from "./curve_field.js";

export default interface MarblingRenderer {
    applyOperations(operations: Operation[]): void;

    reset(): void;

    setSize(width: number, height: number): void;

    // The ordered list of operations applied since the last reset. A backend
    // can be swapped at runtime by constructing the other renderer and
    // replaying this history to reproduce the same image.
    getHistory(): Operation[];

    save(): void;
}

export class InteractiveCurveRenderer implements MarblingRenderer {
    renderCanvas: HTMLCanvasElement;
    displayCanvas: HTMLCanvasElement;
    private readonly field: CurveField = new CurveField();
    private dirty: boolean = true;
    private history: Operation[] = [];

    get baseColor(): Color {
        return this.field.baseColor;
    }

    get drops() {
        return this.field.drops;
    }

    constructor(container: HTMLElement, drawContinuously: boolean = true) {
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        if (drawContinuously) {
            container.insertBefore(this.displayCanvas, container.firstChild);
        }
        this.renderCanvas = document.createElement("canvas");
        this.render();
        if (drawContinuously) {
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    setSize(width: number, height: number) {
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.dirty = true;
    }

    render() {
        const ctx = this.renderCanvas.getContext("2d")!;
        this.field.renderTo(ctx, this.renderCanvas.width, this.renderCanvas.height);
    }

    draw() {
        if (this.dirty) {
            this.render();
            this.dirty = false;
        }
        const ctx = this.displayCanvas.getContext("2d")!;
        ctx.drawImage(this.renderCanvas, 0, 0);
        window.requestAnimationFrame(this.draw.bind(this));
    }

    reset() {
        this.field.reset();
        this.history = [];
        this.dirty = true;
    }

    getHistory(): Operation[] {
        return this.history;
    }

    applyOperations(operations: Operation[]) {
        this.field.applyOperations(operations);
        for (let i = 0; i < operations.length; i++) {
            this.history.push(operations[i]);
        }
        this.dirty = true;
    }

    save() {
        const dataURL = this.renderCanvas.toDataURL("image/png");

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'ink-marbling-image.png'; // Filename for the downloaded image

        // Programmatically click the link to trigger the download
        document.body.appendChild(link); // Append to DOM to work in some browsers
        link.click();
        document.body.removeChild(link); // Clean up
    }

}
