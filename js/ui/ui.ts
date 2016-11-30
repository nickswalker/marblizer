interface MarblingUIDelegate {
    toolDidChange(tool: Tool);
    colorDidChange(color: Color);
    didRequestReset();
    applyOperations(operations: [Operation]);

}

class MarblingUI {
    toolsPane: ToolsPane;
    colorPane: ColorPane;
    _delegate: MarblingUIDelegate;
    private textPane: TextInputPane;
    private keyboardManager: MarblingKeyboardUI;

    constructor(toolsContainer: HTMLElement, colorContainer: HTMLElement, textContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.colorPane = new ColorPane(colorContainer);
        this.textPane = new TextInputPane(textContainer);
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.operationsInput = this.textPane;
    }

    set delegate(delegate: MarblingUIDelegate) {
        this._delegate = delegate;
        this.toolsPane.delegate = delegate;
        this.colorPane.delegate = delegate;
        this.keyboardManager.delegate = delegate;
    }

}