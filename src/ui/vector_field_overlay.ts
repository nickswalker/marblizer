import {Tool} from "./tools.js";
import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import InkDropOperation from "../operations/inkdrop.js";
import LineTine from "../operations/linetine.js";
import WavyLineTine from "../operations/wavylinetine.js";
import CircularLineTine from "../operations/circularlinetine.js";
import Vortex from "../operations/vortex.js";
import VectorFieldRenderer from "../renderer/vector_field_renderer.js";

export default class VectorFieldOverlay {
    private renderer: VectorFieldRenderer;
    private currentTool: Tool = Tool.Drop;
    private currentToolParameter: Object = {"radius": 50};
    private mouseDownCoord: Vec2;
    private lastMouseCoord: Vec2;

    constructor(container: HTMLElement) {
        this.renderer = new VectorFieldRenderer(container);
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        container.addEventListener("mouseout", this.mouseOut.bind(this));
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        document.addEventListener("toolchange", this.toolChange.bind(this));
    }

    private _previewOperation: Operation = null;

    set previewOperation(value: Operation) {
        this._previewOperation = value;
        this.renderer.operation = this._previewOperation as any;
    }

    setSize(width: number, height: number) {
        this.renderer.setSize(width, height);
    }

    toggleVisibility() {
        this.renderer.toggleVisibility();
    }

    increaseResolution() {
        this.renderer['spacing'] = Math.min(80, this.renderer['spacing'] + 2);
    }

    decreaseResolution() {
        this.renderer['spacing'] = Math.max(5, this.renderer['spacing'] - 2);
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        this.currentToolParameter = e.detail.parameters;
        this.generatePreviewOperation();
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        switch (this.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
                this.lastMouseCoord = new Vec2(x, y);
        }
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
    }

    private mouseOut(e: MouseEvent) {
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
        this.previewOperation = null;
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = new Vec2(x, y);
        this.generatePreviewOperation();
    }

    private generatePreviewOperation() {
        switch (this.currentTool) {
            case Tool.Drop: {
                const radius = this.currentToolParameter['radius'];
                this.previewOperation = new InkDropOperation(this.lastMouseCoord, radius, null);
                break;
            }
            case Tool.TineLine: {
                if (this.lastMouseCoord != null && this.mouseDownCoord != null) {
                    const spacing = this.currentToolParameter['spacing'];
                    const numTines = this.currentToolParameter['numTines'];
                    const dir = this.lastMouseCoord.sub(this.mouseDownCoord);
                    if (dir.length() > 0.03) {
                        this.previewOperation = new LineTine(this.mouseDownCoord, dir, numTines, spacing);
                    }
                } else {
                    this.previewOperation = null;
                }
                break;
            }
            case Tool.WavyLine: {
                if (this.lastMouseCoord != null && this.mouseDownCoord != null) {
                    const spacing = this.currentToolParameter['spacing'];
                    const numTines = this.currentToolParameter['numTines'];
                    const dir = this.lastMouseCoord.sub(this.mouseDownCoord);
                    if (dir.length() > 0.03) {
                        this.previewOperation = new WavyLineTine(this.mouseDownCoord, dir, numTines, spacing);
                    }
                    break;
                } else {
                    this.previewOperation = null;
                }
                break;
            }
            case Tool.CircularTine: {
                if (this.lastMouseCoord != null && this.mouseDownCoord != null) {
                    const spacing = this.currentToolParameter['spacing'];
                    const numTines = this.currentToolParameter['numTines'];
                    const radius = this.lastMouseCoord.sub(this.mouseDownCoord).length();
                    if (radius > 0.03) {
                        this.previewOperation = new CircularLineTine(this.mouseDownCoord, radius, numTines, spacing);
                    }
                    break;
                } else {
                    this.previewOperation = null;
                }
                break;
            }
            case Tool.Vortex: {
                if (this.lastMouseCoord != null && this.mouseDownCoord != null) {
                    const radius = this.lastMouseCoord.sub(this.mouseDownCoord).length();
                    if (radius > 0.03) {
                        this.previewOperation = new Vortex(this.mouseDownCoord, radius);
                    }
                    break;
                } else {
                    this.previewOperation = null;
                }
                break;
            }
        }
    }
}