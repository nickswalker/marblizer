///<reference path="panes/modal.ts"/>
class KeyboardShortcutOverlay extends Modal {

    constructor() {
        super();
        this.modal.className += " keyboard-shortcut-overlay";
        this.fetchContent();
    }

    willDismiss() {
        // Nothing to do here
    }

    private handleResponse(e: Event) {
        const response: XMLHttpRequest = e.currentTarget;
        if (response.readyState === 4) {
            if (response.status === 200 || response.status === 304) {
                this.modal.innerHTML += response.responseText;
                this.modal.querySelector(".close-button").addEventListener("click", this.hide.bind(this));
            }
        }
    };

    private fetchContent() {
        const request = new XMLHttpRequest();
        request.onreadystatechange = this.handleResponse.bind(this);
        request.open("POST", "views/keyboard_shortcuts.html", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(null);
    };

}
