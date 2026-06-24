import Color from "../models/color.js";
import Vec2 from "../models/vector.js";
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

    // Reads back the rendered color at each point, or null for points outside
    // the canvas. Batched so callers sampling many points (e.g. scripts) pay
    // one round trip regardless of backend.
    getColorsAt(points: Vec2[]): Promise<(Color | null)[]>;

    save(): void;
}

export class InteractiveCurveRenderer implements MarblingRenderer {
    renderCanvas: HTMLCanvasElement;
    displayCanvas: HTMLCanvasElement;
    private readonly field: CurveField = new CurveField();
    private dirty: boolean = true;
    private history: Operation[] = [];
    // Logical (CSS-pixel) size, as passed to setSize. The backing stores are
    // sized to this times devicePixelRatio so rendering stays sharp on
    // high-DPI displays; operations themselves stay authored in CSS pixels.
    private cssWidth: number = 0;
    private cssHeight: number = 0;

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
        const dpr = window.devicePixelRatio || 1;
        this.cssWidth = width;
        this.cssHeight = height;
        this.displayCanvas.width = Math.round(width * dpr);
        this.displayCanvas.height = Math.round(height * dpr);
        this.renderCanvas.width = Math.round(width * dpr);
        this.renderCanvas.height = Math.round(height * dpr);
        this.dirty = true;
    }

    render() {
        const ctx = this.renderCanvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.field.renderTo(ctx, this.cssWidth, this.cssHeight);
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

    getColorsAt(points: Vec2[]): Promise<(Color | null)[]> {
        if (this.dirty) {
            this.render();
            this.dirty = false;
        }
        const ctx = this.renderCanvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        const colors = points.map((point) => {
            if (point.x < 0 || point.y < 0 || point.x >= this.cssWidth || point.y >= this.cssHeight) {
                return null;
            }
            const [r, g, b, a] = ctx.getImageData(Math.round(point.x * dpr), Math.round(point.y * dpr), 1, 1).data;
            return new Color(r, g, b, a / 255);
        });
        return Promise.resolve(colors);
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
