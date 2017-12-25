import Modal from "./modal.js";

export default class UINotification extends Modal {
    callback: Function;

    constructor(content: string, callback: Function) {
        super();
        this.modal.className += " notification";
        this.modal.innerHTML = content;
        this.callback = callback;
    }

    willDismiss() {
        this.callback();
    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(true);
    }

    private didClickDismiss(event: MouseEvent) {
        this.hide();
        this.callback(false);
    }

}