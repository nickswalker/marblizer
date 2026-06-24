import {default as ControlsPane, UICommand} from "./panes/controlspane.js";
import Operation from "../operations/color_operations.js";
import ToolsPane from "./panes/toolspane.js";
import ColorPane from "./panes/colorpane.js";
import ScriptingPane from "./panes/scriptingpane.js";
import Vec2 from "../models/vector.js";
import MarblingKeyboardUI, {KeyboardShortcut} from "./keyboard.js";
import CursorOverlay from "./cursor/cursor_overlay.js";
import VectorFieldOverlay from "./vector_field_overlay.js";
import InkPreviewOverlay from "./ink_preview_overlay.js";
import InkDropOperation from "../operations/inkdrop.js";
import {Tool} from "./tools.js";
import Vortex from "../operations/vortex.js";
import {counterclockwiseForDrag} from "../operations/rotation_direction.js";
import CircularLineTine from "../operations/circularlinetine.js";
import WavyLineTine from "../operations/wavylinetine.js";
import LineTine from "../operations/linetine.js";
import HelpDialog from "./components/help-dialog.js";
import UserProgram from "../scripting/user_program.js";
import MarblingRenderer from "../renderer/curve_renderer.js";
import ParameterStepperPane from "./panes/parameter_stepper_pane.js";


function trackEvent(path: string) {
    const gc = (window as any).goatcounter;
    if (gc?.count) {
        gc.count({ path: `marblizer.${path}`, event: true });
    }
}

// The UI talks to whichever rendering backend (vector or, later, GPU) is
// active purely through the shared renderer interface.
export interface MarblingRendererDelegate extends MarblingRenderer {
    undo(): void;

    redo(): void;

    saveSVG(): void;

    canUndo(): boolean;

    canRedo(): boolean;
}

export interface MarblingUIDelegate {
    applyCommand(command: UICommand): void
}

export default class MarblingUI implements MarblingUIDelegate {
    toolsPane: ToolsPane;
    colorPane: ColorPane;
    controlsPane: ControlsPane;
    private scriptingPane: ScriptingPane;
    private lastMouseCoord: Vec2 | null = null;
    private mouseDownCoord: Vec2 | null = null;
    private mouseInterval: number = 0;
    private helpDialog: HelpDialog;
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;
    readonly inkPreviewOverlay: InkPreviewOverlay;
    private toolbarPanel: Element | null;
    private cancelZoneActive: boolean = false;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, optionsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement, parametersContainer: HTMLElement) {
        this.toolbarPanel = toolsContainer.closest(".marbling-pane");
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.scriptingPane = new ScriptingPane(textContainer);
        this.controlsPane = new ControlsPane(optionsContainer);
        this.controlsPane.uiDelegate = this;
        new ParameterStepperPane(parametersContainer, this.toolsPane.toolParameters);
        this.helpDialog = new HelpDialog();
        document.body.appendChild(this.helpDialog);
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this;
        container.addEventListener("pointerdown", this.mouseDown.bind(this));
        container.addEventListener("pointerup", this.mouseUp.bind(this));
        container.addEventListener("pointercancel", this.mouseUp.bind(this));
        container.addEventListener("pointermove", this.mouseMove.bind(this));
        container.addEventListener("wheel", this.scroll.bind(this), {passive: false});
        document.addEventListener("pointerout", this.mouseOut.bind(this));
        this.inkPreviewOverlay = new InkPreviewOverlay(container, () => this.colorPane.currentColor);
        this.cursorOverlay = new CursorOverlay(container);
        this.vectorFieldOverlay = new VectorFieldOverlay(container);
    }

    _delegate!: MarblingRendererDelegate;

    set delegate(delegate: MarblingRendererDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.controlsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
        this.syncHistoryControls();
    }

    private _size!: Vec2;

    set size(size: Vec2) {
        this.inkPreviewOverlay.setSize(size.x, size.y);
        this.cursorOverlay.setSize(size.x, size.y);
        this.vectorFieldOverlay.setSize(size.x, size.y);
        this._size = size;
    }

    didPressShortcut(shortcut: KeyboardShortcut): void {
        switch (shortcut) {
            case KeyboardShortcut.S:
                if (this.keyboardManager.controlDown) {
                    this._delegate.save();
                } else {
                    this.keyboardManager.acceptingNewKeys = false;
                    this.scriptingPane.getInput(this.didEnterInput.bind(this));
                }
                return;
            case KeyboardShortcut.Undo:
                this._delegate.undo();
                this.syncHistoryControls();
                return;
            case KeyboardShortcut.Redo:
                this._delegate.redo();
                this.syncHistoryControls();
                return;
            case KeyboardShortcut.ToggleFullscreen:
                this.toggleFullscreen();
                return;
            case KeyboardShortcut.Up:
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Down:
                this.toolsPane.toolParameters.decreasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Right:
                this.toolsPane.toolParameters.increaseSecondary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Left:
                this.toolsPane.toolParameters.decreaseSecondary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.R:
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                    this.syncHistoryControls();
                }
                return;
            case KeyboardShortcut.F:
                this.vectorFieldOverlay.toggleVisibility();
                return;
            case KeyboardShortcut.BracketLeft:
                this.vectorFieldOverlay.decreaseResolution();
                return;
            case KeyboardShortcut.BracketRight:
                this.vectorFieldOverlay.increaseResolution();
                return;
            case KeyboardShortcut.D:
                this.toolsPane.selectTool(Tool.Drop);
                return;
            case KeyboardShortcut.X:
                this.toolsPane.selectTool(Tool.Spatter);
                return;
            case KeyboardShortcut.L:
                this.toolsPane.selectTool(Tool.TineLine);
                return;
            case KeyboardShortcut.C:
                this.toolsPane.selectTool(Tool.CircularTine);
                return;
            case KeyboardShortcut.W:
                this.toolsPane.selectTool(Tool.WavyLine);
                return;
            case KeyboardShortcut.V:
                this.toolsPane.selectTool(Tool.Vortex);
                return;
            case KeyboardShortcut.QuestionMark:
                if (this.keyboardManager.shiftDown) {
                    this.helpDialog.show();
                }
                return;

        }
    }

    applyCommand(command: UICommand): void {
        switch (command) {
            case UICommand.Reset: {
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                    this.syncHistoryControls();
                }
                return;
            }
            case UICommand.Save: {
                this._delegate.save();
                trackEvent("download-png");
                return;
            }
            case UICommand.SaveSVG: {
                this._delegate.saveSVG();
                trackEvent("download-svg");
                return;
            }
            case UICommand.Undo: {
                this._delegate.undo();
                this.syncHistoryControls();
                return;
            }
            case UICommand.Redo: {
                this._delegate.redo();
                this.syncHistoryControls();
                return;
            }
            case UICommand.ShowField: {
                this.vectorFieldOverlay.toggleVisibility();
                return;
            }
            case UICommand.ShowHelp: {
                this.helpDialog.show();
                trackEvent("help-open");
                return;
            }
            case UICommand.ToggleFullscreen: {
                this.toggleFullscreen();
                return;
            }
            case UICommand.ShowScriptEditor: {
                this.scriptingPane.getInput(this.didEnterInput.bind(this));
            }
        }
    }

    private async didEnterInput(input: string | null) {
        this.keyboardManager.acceptingNewKeys = true;
        if (input == null) {
            return;
        }
        let result: Operation[] | null = null;
        try {
            const userProgram = new UserProgram(input);
            result = await userProgram.execute(this._size, {
                history: this._delegate.getHistory(),
                foregroundColor: this.colorPane.currentColor,
                backgroundColor: this.colorPane.backgroundColor,
                getColorsAt: (points) => this._delegate.getColorsAt(points),
            });
        } catch (e) {
            alert(e);
        }
        if (result != null && result.length > 0) {
            this._delegate.applyOperations(result);
            this.syncHistoryControls();
            trackEvent("run-script");
        }

    }

    private mouseDown(e: PointerEvent) {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        this.setCancelZoneActive(false);
        if (this.toolsPane.currentTool === Tool.Spatter) {
            this.mouseHeldHandler(true);
        }
        this.mouseInterval = setInterval(this.mouseHeldHandler.bind(this), 50)
    }

    // Dragging into the toolbar panel cancels the in-progress operation
    // instead of committing it where the pointer happens to end up. Plain
    // DOM boundary events (pointerout/pointerover) can't drive this: the
    // captured pointer (see setPointerCapture above) keeps delivering move
    // events to the original target no matter where it travels, and
    // capture suppresses boundary events for that pointer entirely. So we
    // hit-test the pointer's viewport coordinates against the toolbar's
    // bounding rect directly.
    private isOverToolbar(clientX: number, clientY: number): boolean {
        if (this.toolbarPanel == null) {
            return false;
        }
        const rect = this.toolbarPanel.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }

    private setCancelZoneActive(active: boolean) {
        this.cancelZoneActive = active;
        this.toolbarPanel?.classList.toggle("drag-cancel-target", active);
    }

    private mouseUp(e: PointerEvent) {
        if (this.mouseDownCoord == null) {
            return;
        }
        const wasCancelled = this.cancelZoneActive;
        this.setCancelZoneActive(false);
        if (wasCancelled) {
            this.lastMouseCoord = null;
            this.mouseDownCoord = null;
            clearInterval(this.mouseInterval);
            this.mouseInterval = 0;
            return;
        }
        const x = e.offsetX;
        const y = e.offsetY;
        let operation: Operation;
        const currentCoord = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Drop)['radius'];
                operation = new InkDropOperation(new Vec2(x, y), dropRadius, this.colorPane.currentColor, !this.keyboardManager.shiftDown);
                this._delegate.applyOperations([operation]);
                this.syncHistoryControls();
                break;
            case Tool.TineLine: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    const numTines = this.toolsPane.toolParameters.forTool(Tool.TineLine)['numTines'];
                    const spacing = this.toolsPane.toolParameters.forTool(Tool.TineLine)['spacing'];
                    operation = new LineTine(this.mouseDownCoord, direction, numTines, spacing);
                    this._delegate.applyOperations([operation]);
                    this.syncHistoryControls();
                }
                break;
            }
            case Tool.WavyLine: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    const numTines = this.toolsPane.toolParameters.forTool(Tool.WavyLine)['numTines'];
                    const spacing = this.toolsPane.toolParameters.forTool(Tool.WavyLine)['spacing'];
                    operation = new WavyLineTine(this.mouseDownCoord, direction, numTines, spacing);
                    this._delegate.applyOperations([operation]);
                    this.syncHistoryControls();
                }
                break;
            }
            case Tool.CircularTine: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                const radius = direction.length();
                const numTines = this.toolsPane.toolParameters.forTool(Tool.CircularTine)['numTines'];
                const spacing = this.toolsPane.toolParameters.forTool(Tool.CircularTine)['spacing'];
                if (radius > 0.03) {
                    operation = new CircularLineTine(this.mouseDownCoord, radius, numTines, spacing, counterclockwiseForDrag(direction));
                    this._delegate.applyOperations([operation]);
                    this.syncHistoryControls();
                }
                break;
            }
            case Tool.Vortex: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                const radius = direction.length();
                if (radius > 0.03) {
                    operation = new Vortex(this.mouseDownCoord, radius, counterclockwiseForDrag(direction));
                    this._delegate.applyOperations([operation]);
                    this.syncHistoryControls();
                }
                break;
            }

        }
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
        clearInterval(this.mouseInterval);
        this.mouseInterval = 0;
    }

    private mouseMove(e: PointerEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = new Vec2(x, y);
        if (this.mouseDownCoord != null) {
            this.setCancelZoneActive(this.isOverToolbar(e.clientX, e.clientY));
        }
    }

    private mouseOut(e: PointerEvent) {
        this.mouseDownCoord = null;
        this.lastMouseCoord = null;
        this.setCancelZoneActive(false);
    }

    // force bypasses the per-tick coin flip, used to deposit a guaranteed
    // first dot on mouseDown instead of waiting on the 50ms interval.
    private mouseHeldHandler(force: boolean = false) {
        switch (this.toolsPane.currentTool) {
            case Tool.Spatter:
                if (this.mouseDownCoord != null && !this.cancelZoneActive) {
                    const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Spatter)['dropRadius'];
                    const scatterRadius = this.toolsPane.toolParameters.forTool(Tool.Spatter)['scatterRadius'];
                    const currentColor = this.colorPane.currentColor;
                    if (force || Math.random() < 0.5) {
                        const origin = this.lastMouseCoord ?? this.mouseDownCoord;
                        const angle = Math.random() * 2 * Math.PI;
                        const radius = Math.sqrt(Math.random()) * scatterRadius;
                        const newOrigin = origin.add(new Vec2(Math.cos(angle) * radius, Math.sin(angle) * radius));
                        const newRadius = Math.random() * 6 + dropRadius - 3;
                        const operation = new InkDropOperation(newOrigin, newRadius, currentColor, false);
                        this._delegate.applyOperations([operation]);
                        this.syncHistoryControls();
                    }
                }
        }
    }


    private scroll(e: WheelEvent) {
        e.preventDefault();
        const delta = e.deltaY;
        if (delta > 0) {
            if (!this.keyboardManager.shiftDown) {
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
            } else {
                this.toolsPane.toolParameters.increaseSecondary(this.toolsPane.currentTool);
            }
        } else {
            if (!this.keyboardManager.shiftDown) {
                this.toolsPane.toolParameters.decreasePrimary(this.toolsPane.currentTool);
            } else {
                this.toolsPane.toolParameters.decreaseSecondary(this.toolsPane.currentTool);
            }
        }
    }

    syncHistoryControls() {
        if (this._delegate == null) {
            return;
        }
        this.controlsPane.setHistoryState(this._delegate.canUndo(), this._delegate.canRedo());
    }

    private toggleFullscreen() {
        try {
            if (document.fullscreenElement == null) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch (e) {
            alert(e);
        }
    }


}
