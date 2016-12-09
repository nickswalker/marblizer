///<reference path="../marbling_renderer.ts"/>
///<reference path="cursor/cursor_overlay.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="vector_field_overlay.ts"/>
///<reference path="../operations/linetine.ts"/>
///<reference path="panes/toolspane.ts"/>
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
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.textPane = new TextInputPane(textContainer);
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this;
        container.onmousedown = this.mouseDown.bind(this);
        container.onmouseup = this.mouseUp.bind(this);
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousewheel", this.scroll.bind(this));
        this.cursorOverlay = new CursorOverlay(container);
        this.vectorFieldOverlay = new VectorFieldOverlay(container);
    }

    private didEnterInput(input: string) {
        this.keyboardManager.acceptingNewKeys = true;
        const parsed = <[Operation]>OperationsParser.parse(input);
        if (parsed != null && parsed.length > 0) {
            this._delegate.applyOperations(parsed);
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
        }
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
        }
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        let operation: Operation;
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                const dropRadius = this.toolsPane.toolParameters.forTool(Tool.Drop).radius;
                operation = new InkDropOperation(new Vec2(x, y), dropRadius, this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
                break;
            case Tool.TineLine:
                const currentCoord = new Vec2(x, y);
                const direction = currentCoord.sub(this.mouseDownCoord);
                if (direction.length() > 0.03) {
                    const numTines = this.toolsPane.toolParameters.forTool(Tool.TineLine).numTines;
                    const spacing = this.toolsPane.toolParameters.forTool(Tool.TineLine).spacing;
                    operation = new LineTine(this.mouseDownCoord, direction, numTines, spacing);
                    this._delegate.applyOperations([operation]);
                }

                break;

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
                        const newOrigin = mouseCoords.add(new Vec2(Math.random() * radius, Math.random() * radius));
                        const newRadius = Math.random() * variablity + 10;
                        const operation = new InkDropOperation(newOrigin, newRadius, currentColor, false);
                        this._delegate.applyOperations([operation]);
                    }
                }
        }
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