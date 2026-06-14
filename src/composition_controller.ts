import Vec2 from "./models/vector.js";
import Operation from "./operations/color_operations.js";
import MarblingRenderer from "./renderer/curve_renderer.js";
import {downloadSVG} from "./renderer/svg_exporter.js";
import {clearCompositionDraft, saveCompositionDraft} from "./composition_storage.js";

export default class CompositionController implements MarblingRenderer {
    private renderer: MarblingRenderer;
    private history: Operation[] = [];
    private redoHistory: Operation[] = [];
    private stateChanged: () => void = () => {};

    constructor(renderer: MarblingRenderer) {
        this.renderer = renderer;
    }

    setRenderer(renderer: MarblingRenderer) {
        this.renderer = renderer;
        this.replay();
        this.notifyStateChanged();
    }

    onStateChanged(callback: () => void) {
        this.stateChanged = callback;
    }

    applyOperations(operations: Operation[]) {
        if (operations.length === 0) {
            return;
        }
        this.history.push(...operations);
        this.redoHistory = [];
        this.renderer.applyOperations(operations);
        this.persist();
        this.notifyStateChanged();
    }

    reset() {
        this.history = [];
        this.redoHistory = [];
        this.renderer.reset();
        clearCompositionDraft();
        this.notifyStateChanged();
    }

    setSize(width: number, height: number) {
        this.renderer.setSize(width, height);
    }

    getHistory(): Operation[] {
        return this.history;
    }

    save() {
        this.renderer.save();
    }

    saveSVG() {
        downloadSVG(this.history, new Vec2(window.innerWidth, window.innerHeight));
    }

    undo() {
        const operation = this.history.pop();
        if (operation == null) {
            return;
        }
        this.redoHistory.push(operation);
        this.replay();
        this.persist();
        this.notifyStateChanged();
    }

    redo() {
        const operation = this.redoHistory.pop();
        if (operation == null) {
            return;
        }
        this.history.push(operation);
        this.replay();
        this.persist();
        this.notifyStateChanged();
    }

    canUndo(): boolean {
        return this.history.length > 0;
    }

    canRedo(): boolean {
        return this.redoHistory.length > 0;
    }

    restore(operations: Operation[]) {
        this.history = [...operations];
        this.redoHistory = [];
        this.replay();
        this.persist();
        this.notifyStateChanged();
    }

    private replay() {
        this.renderer.reset();
        this.renderer.applyOperations(this.history);
    }

    private persist() {
        if (this.history.length === 0) {
            clearCompositionDraft();
            return;
        }
        saveCompositionDraft(this.history, new Vec2(window.innerWidth, window.innerHeight));
    }

    private notifyStateChanged() {
        this.stateChanged();
    }
}
