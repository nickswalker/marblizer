class TextInputPane {
    element: HTMLElement;
    callback: Function;
    active: boolean;
    private textArea: HTMLTextAreaElement;
    private confirmButton: HTMLElement;
    private dismissButton: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
        this.textArea = <HTMLTextAreaElement>element.querySelector("textarea");
        this.dismissButton = <HTMLElement>element.querySelector(".cancel");
        this.confirmButton = <HTMLElement>element.querySelector(".confirm");

        this.confirmButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
    }

    getInput(callback: Function) {
        this.callback = callback;
        this.show();
    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(this.textArea.value);
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