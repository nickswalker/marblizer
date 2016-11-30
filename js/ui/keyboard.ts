///<reference path="ui.ts"/>
///<reference path="panes.ts"/>
///<reference path="../operation.ts"/>
class MarblingKeyboardUI {
    delegate: MarblingUIDelegate;
    operationsInput: TextInputPane;

    constructor() {
        window.onkeypress = this.keyWasPressed.bind(this);

    }

    keyWasPressed(event: KeyboardEvent) {
        if (this.operationsInput.active) {
            return;
        }
        switch (event.key) {
            case "s":
                this.operationsInput.getInput(this.didEnterInput.bind(this));
                return
        }
    }

    private didEnterInput(input: string) {
        const parsed = <[Operation]>OperationsParser.parse(input);
        if (parsed != null && parsed.length > 0) {
            this.delegate.applyOperations(parsed);
        }

    }

}