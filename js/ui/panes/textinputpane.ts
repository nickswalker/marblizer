///<reference path="../../example_scripts.ts"/>
///<reference path="../../.d.ts"/>
class TextInputPane {
    element: HTMLElement;
    callback: Function;
    active: boolean;
    private codeMirror: CodeMirror.Editor;
    private confirmButton: HTMLElement;
    private dismissButton: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.dismissButton = <HTMLElement>element.querySelector(".cancel");
        this.confirmButton = <HTMLElement>element.querySelector(".confirm");

        this.codeMirror = CodeMirror(<HTMLElement>element.querySelector(".input-container"), {
            value: tutorialProgram,
            mode: "javascript",
            lineNumbers: true,
            theme: "solarized dark"
        });

        this.confirmButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
    }

    getInput(callback: Function) {
        this.callback = callback;
        this.show();
    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(this.codeMirror.getValue());
    }

    private didClickDismiss(event: MouseEvent) {
        this.hide();
        this.callback("");
    }

    hide() {
        this.active = false;
        this.element.style.visibility = "hidden";
    }

    show() {
        this.active = true;
        this.element.style.visibility = "initial";
    }
}