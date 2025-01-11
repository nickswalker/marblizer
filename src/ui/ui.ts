import {default as ControlsPane, UICommand} from "./panes/controlspane.js";
import Operation from "../operations/color_operations.js";
import ToolsPane from "./panes/toolspane.js";
import ColorPane from "./panes/colorpane.js";
import ScriptingPane from "./panes/scriptingpane.js";
import Vec2 from "../models/vector.js";
import Modal from "./panes/modal.js";
import MarblingKeyboardUI, {KeyboardShortcut} from "./keyboard.js";
import CursorOverlay from "./cursor/cursor_overlay.js";
import VectorFieldOverlay from "./vector_field_overlay.js";
import InkDropOperation from "../operations/inkdrop.js";
import {Tool} from "./tools.js";
import Vortex from "../operations/vortex.js";
import CircularLineTine from "../operations/circularlinetine.js";
import WavyLineTine from "../operations/wavylinetine.js";
import LineTine from "../operations/linetine.js";
import KeyboardShortcutOverlay from "./help_overlay.js";
import UserProgram from "../scripting/user_program.js";


export interface MarblingRendererDelegate {
    reset();

    applyOperations(operations: [Operation]);

    save();
}

export interface MarblingUIDelegate {
    applyCommand(command: UICommand)
}

export default class MarblingUI implements MarblingUIDelegate {
    toolsPane: ToolsPane;
    colorPane: ColorPane;
    controlsPane: ControlsPane;
    private scriptingPane: ScriptingPane;
    private lastMouseCoord: Vec2;
    private mouseDownCoord: Vec2;
    private mouseInterval: number;
    private keyboardShortcutOverlay: Modal;
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, optionsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.scriptingPane = new ScriptingPane(textContainer);
        this.controlsPane = new ControlsPane(optionsContainer);
        this.controlsPane.uiDelegate = this;
        this.keyboardShortcutOverlay = new KeyboardShortcutOverlay();
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this;
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousewheel", this.scroll.bind(this));
        document.addEventListener("mouseout", this.mouseOut.bind(this));
        this.cursorOverlay = new CursorOverlay(container);
        this.vectorFieldOverlay = new VectorFieldOverlay(container);
    }

    _delegate: MarblingRendererDelegate;

    set delegate(delegate: MarblingRendererDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.controlsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
    }

    private _size: Vec2;

    set size(size: Vec2) {
        this.cursorOverlay.setSize(size.x, size.y);
        this.vectorFieldOverlay.setSize(size.x, size.y);
        this._size = size;
    }

    didPressShortcut(shortcut: KeyboardShortcut) {
        switch (shortcut) {
            case KeyboardShortcut.S:
                if (this.keyboardManager.controlDown) {
                    this._delegate.save();
                } else {
                    this.keyboardManager.acceptingNewKeys = false;
                    this.scriptingPane.getInput(this.didEnterInput.bind(this));
                }
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
                }
                return;
            case KeyboardShortcut.F:
                this.vectorFieldOverlay.toggleVisibility();
                return;
            case KeyboardShortcut.Q:
                this.vectorFieldOverlay.decreaseResolution();
                return;
            case KeyboardShortcut.W:
                this.vectorFieldOverlay.increaseResolution();
                return;
            case KeyboardShortcut.QuestionMark:
                if (this.keyboardManager.shiftDown) {
                    this.keyboardShortcutOverlay.show();
                }
                return;

        }
    }

    applyCommand(command: UICommand) {
        switch (command) {
            case UICommand.Reset: {
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                }
                return;
            }
            case UICommand.Save: {
                this._delegate.save();
                return;
            }
            case UICommand.ShowField: {
                this.vectorFieldOverlay.toggleVisibility();
                return;
            }
            case UICommand.ShowHelp: {
                return;
            }
            case UICommand.ShowKeyboardShortcutOverlay: {
                this.keyboardShortcutOverlay.show();
                return;
            }
            case UICommand.ShowScriptEditor: {
                this.scriptingPane.getInput(this.didEnterInput.bind(this));
            }
        }
    }

    private didEnterInput(input: string) {
        this.keyboardManager.acceptingNewKeys = true;
        if (input == null) {
            return;
        }
        let result: [Operation];
        try {
            const userProgram = new UserProgram(input);
            result = userProgram.execute(this._size);
        } catch (e) {
            alert(e);
        }
        if (result != null && result.length > 0) {
            this._delegate.applyOperations(result);
        }

    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        this.mouseInterval = setInterval(this.mouseHeldHandler.bind(this), 50)
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        let operation: Operation;
        const currentCoord = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Drop)['radius'];
                operation = new InkDropOperation(new Vec2(x, y), dropRadius, this.colorPane.currentColor, !this.keyboardManager.shiftDown);
                this._delegate.applyOperations([operation]);
                break;
            case Tool.TineLine: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    const numTines = this.toolsPane.toolParameters.forTool(Tool.TineLine)['numTines'];
                    const spacing = this.toolsPane.toolParameters.forTool(Tool.TineLine)['spacing'];
                    operation = new LineTine(this.mouseDownCoord, direction, numTines, spacing);
                    this._delegate.applyOperations([operation]);
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
                }
                break;
            }
            case Tool.CircularTine: {
                const radius = currentCoord.sub(this.mouseDownCoord).length();
                const numTines = this.toolsPane.toolParameters.forTool(Tool.CircularTine)['numTines'];
                const spacing = this.toolsPane.toolParameters.forTool(Tool.CircularTine)['spacing'];
                if (radius > 0.03) {
                    operation = new CircularLineTine(this.mouseDownCoord, radius, numTines, spacing);
                    this._delegate.applyOperations([operation]);
                }
                break;
            }
            case Tool.Vortex: {
                const radius = currentCoord.sub(this.mouseDownCoord).length();
                if (radius > 0.03) {
                    operation = new Vortex(this.mouseDownCoord, radius);
                    this._delegate.applyOperations([operation]);
                }
                break;
            }

        }
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
        clearInterval(this.mouseInterval);
        this.mouseInterval = 0;
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = new Vec2(x, y);

    }

    private mouseOut(e: MouseEvent) {
        this.mouseDownCoord = null;
        this.lastMouseCoord = null;
    }

    private mouseHeldHandler() {
        switch (this.toolsPane.currentTool) {
            case Tool.Spatter:
                if (this.mouseDownCoord != null) {
                    const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Spatter)['dropRadius'];
                    const scatterRadius = this.toolsPane.toolParameters.forTool(Tool.Spatter)['scatterRadius'];
                    const currentColor = this.colorPane.currentColor;
                    if (Math.random() < 0.5) {
                        const newOrigin = this.lastMouseCoord.add(new Vec2(Math.random() * 2 * scatterRadius - scatterRadius, Math.random() * 2 * scatterRadius - scatterRadius));
                        const newRadius = Math.random() * 6 + dropRadius - 3;
                        const operation = new InkDropOperation(newOrigin, newRadius, currentColor, false);
                        this._delegate.applyOperations([operation]);
                    }
                }
        }
    }


    private scroll(e: WheelEvent) {
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


}