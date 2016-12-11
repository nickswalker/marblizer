///<reference path="../../scripting/example_scripts.ts"/>
///<reference path="../../.d.ts"/>
///<reference path="../../scripting/user_program.ts"/>
///<reference path="notification.ts"/>

class ScriptingPane {
    container: HTMLElement;
    modal: HTMLElement;
    callback: Function;
    active: boolean;
    private codeMirror: CodeMirror.Editor;
    private runButton: HTMLElement;
    private dismissButton: HTMLElement;
    private getURL: HTMLElement;
    private downOnContainer: boolean = false;
    constructor(element: HTMLElement) {
        this.container = element.parentElement;
        this.modal = element;
        this.dismissButton = <HTMLElement>element.querySelector(".close-button");
        this.runButton = <HTMLElement>element.querySelector(".run-button");
        this.getURL = <HTMLElement>element.querySelector(".get-url-button");
        this.codeMirror = CodeMirror(<HTMLElement>element.querySelector(".input-container"), {
            value: tutorialProgram,
            mode: "javascript",
            lineNumbers: true,
            theme: "solarized dark"
        });

        this.runButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
        this.getURL.onclick = this.didClickGetURL.bind(this);
        this.container.onmouseup = this.upContainer.bind(this);
        this.container.onmousedown = this.downContainer.bind(this);
    }

    getInput(callback: Function) {
        this.callback = callback;
        this.show();
    }

    private downContainer(event: MouseEvent) {
        this.downOnContainer = event.target == this.container;
    }

    private upContainer(event: MouseEvent) {
        if (event.target == this.container && this.downOnContainer) {
            this.hide();
            this.callback(null);
        }
        this.downOnContainer = false;

    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(this.codeMirror.getValue());
    }

    private didClickDismiss(event: MouseEvent) {
        this.hide();
        this.callback(null);
    }

    private didClickGetURL() {
        const program = LZString.compressToEncodedURIComponent(this.codeMirror.getValue());
        const base = window.location;
        const baseUrl = base.protocol + "//" + base.host + "/" + base.pathname.split('/')[1];

        const notification = new Notification(baseUrl + "?p=" + program, null);
        notification.show();
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