///<reference path="../marbling.ts"/>
///<reference path="cursor_overlay.ts"/>
interface MarblingUIDelegate {
    reset();
    applyOperations(operations: [Operation]);

}

class MarblingUI {

    private vectorFieldBuffer: HTMLCanvasElement;
    toolsPane: ToolsPane;
    colorPane: ColorPane;
    _delegate: MarblingUIDelegate;
    private lastMouseCoord: Vec2;
    private textPane: TextInputPane;
    private keyboardManager: MarblingKeyboardUI;
    private cursorOverlay: CursorOverlay;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.textPane = new TextInputPane(textContainer);
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this.didPressShortcut.bind(this);
        container.onmousedown = this.mouseDown.bind(this);
        container.onmouseup = this.mouseUp.bind(this);
        this.cursorOverlay = new CursorOverlay(container);
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
    }

    private didPressShortcut(shortcut: KeyboardShortcut) {
        switch (shortcut) {
            case KeyboardShortcut.S:
                this.keyboardManager.acceptingNewKeys = false;
                this.textPane.getInput(this.didEnterInput.bind(this));
                return;
            case KeyboardShortcut.Plus:
                this.toolsPane.increaseToolParameter(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Minus:
                this.toolsPane.decreaseToolParameter(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.R:
                if (confirm("Clear the composition?")) {
                    this._delegate.reset();
                }
        }
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                break;
            case Tool.TineLine:
                this.lastMouseCoord = new Vec2(x, y);
        }
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.toolsPane.currentTool) {
            case Tool.Drop:
                const operation = new InkDropOperation(new Vec2(x, y), this.toolsPane.toolParameters[Tool.Drop], this.colorPane.currentColor);
                this._delegate.applyOperations([operation]);
                break;
            case Tool.TineLine:
                const currentCoord = new Vec2(x, y);
                this.applyTine(this.lastMouseCoord, currentCoord.sub(this.lastMouseCoord));
        }
    }


}