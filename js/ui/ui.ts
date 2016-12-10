///<reference path="../marbling_renderer.ts"/>
///<reference path="cursor/cursor_overlay.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="vector_field_overlay.ts"/>
///<reference path="../operations/linetine.ts"/>
///<reference path="../operations/circularlinetine.ts"/>
///<reference path="panes/toolspane.ts"/>
///<reference path="panes/colorpane.ts"/>
///<reference path="help_overlay.ts"/>

interface MarblingUIDelegate {
    reset();
    applyOperations(operations: [Operation]);

}

class MarblingUI {

    toolsPane: ToolsPane;
    colorPane: ColorPane;
    _delegate: MarblingUIDelegate;
    private lastMouseCoord: Vec2;
    private mouseDownCoord: Vec2;
    private textPane: TextInputPane;
    private keyboardShortcutOverlay: KeyboardShortcutOverlay;
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.textPane = new TextInputPane(textContainer);
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

    private didEnterInput(input: string) {
        this.keyboardManager.acceptingNewKeys = true;
        let result: [Operation];
        try {
            result = new Function(input)();
        } catch (e) {
            alert(e);
        }
        if (result != null && result.length > 0) {
            this._delegate.applyOperations(result);
        }

    }

    set delegate(delegate: MarblingUIDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
    }

    setSize(width: number, height: number) {
        this.cursorOverlay.setSize(width, height);
        this.vectorFieldOverlay.setSize(width, height);
    }

    didPressShortcut(shortcut: KeyboardShortcut) {
        switch (shortcut) {
            case KeyboardShortcut.S:
                this.keyboardManager.acceptingNewKeys = false;
                this.textPane.getInput(this.didEnterInput.bind(this));
                return;
            case KeyboardShortcut.Plus:
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Minus:
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.R:
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                }
                return;
            case KeyboardShortcut.B:
                const operation = new ChangeBaseColorOperation(this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
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

        }
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        let operation: Operation;
        const currentCoord = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Drop).radius;
                operation = new InkDropOperation(new Vec2(x, y), dropRadius, this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
                break;
            case Tool.TineLine: {
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    const numTines = this.toolsPane.toolParameters.forTool(Tool.TineLine).numTines;
                    const spacing = this.toolsPane.toolParameters.forTool(Tool.TineLine).spacing;
                    operation = new LineTine(this.mouseDownCoord, direction, numTines, spacing);
                    this._delegate.applyOperations([operation]);
                }
                break;
            }
            case Tool.CircularTine: {
                const radius = currentCoord.sub(this.mouseDownCoord).length();
                const numTines = this.toolsPane.toolParameters.forTool(Tool.CircularTine).numTines;
                const spacing = this.toolsPane.toolParameters.forTool(Tool.CircularTine).spacing;
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
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        const mouseCoords = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Spatter:
                if (this.mouseDownCoord != null) {
                    const variablity = this.toolsPane.toolParameters.forTool(Tool.Spatter).variability;
                    const radius = this.toolsPane.toolParameters.forTool(Tool.Spatter).radius;
                    const currentColor = this.colorPane.currentColor;
                    if (Math.random() < 0.1) {
                        const newOrigin = mouseCoords.add(new Vec2(Math.random() * 2 * radius - radius, Math.random() * 2 * radius - radius));
                        const newRadius = Math.random() * variablity + 10;
                        const operation = new InkDropOperation(newOrigin, newRadius, currentColor, false);
                        this._delegate.applyOperations([operation]);
                    }
                }
        }
    }

    private mouseOut(e: MouseEvent) {
        this.mouseDownCoord = null;
        this.lastMouseCoord = null;
    }


    private scroll(e: MouseWheelEvent) {
        const delta = e.wheelDelta;
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