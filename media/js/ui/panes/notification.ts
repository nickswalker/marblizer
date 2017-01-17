///<reference path="../../scripting/example_scripts.ts"/>
///<reference path="../../.d.ts"/>
///<reference path="modal.ts"/>

class Notification extends Modal {
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