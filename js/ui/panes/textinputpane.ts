///<reference path="../../example_scripts.ts"/>
///<reference path="../../.d.ts"/>
class TextInputPane {
    private container: HTMLElement;
    modal: HTMLElement;
    callback: Function;
    active: boolean;
    private codeMirror: CodeMirror.Editor;
    private confirmButton: HTMLElement;
    private dismissButton: HTMLElement;

    constructor(element: HTMLElement) {
        this.container = element.parentElement;
        this.modal = element;
        this.dismissButton = <HTMLElement>element.querySelector(".close-button");
        this.confirmButton = <HTMLElement>element.querySelector(".run-button");

        this.codeMirror = CodeMirror(<HTMLElement>element.querySelector(".input-container"), {
            value: tutorialProgram,
            mode: "javascript",
            lineNumbers: true,
            theme: "solarized dark"
        });

        this.confirmButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
        this.container.onclick = this.didClickDismiss.bind(this);
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
        if (event.target != this.container && event.target != this.dismissButton) {
            return;
        }
        this.hide();
        this.callback(null);
    }

    hide() {
        this.active = false;
        this.container.style.visibility = "hidden";
        this.container.style.display = "none";
    }

    show() {
        this.active = true;
        this.container.removeAttribute("style");
        this.codeMirror.refresh();
    }
}