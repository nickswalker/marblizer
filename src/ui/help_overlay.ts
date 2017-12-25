import Modal from "./panes/modal.js";

export default class KeyboardShortcutOverlay extends Modal {

    constructor() {
        super();
        this.modal.className += " keyboard-shortcut-overlay";
        this.fetchContent();
    }

    willDismiss() {
        // Nothing to do here
    }

    private fetchContent() {
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 200 || request.status === 304) {
                    this.modal.innerHTML += request.responseText;
                    this.modal.querySelector(".close-button").addEventListener("click", this.hide.bind(this));
                }
            }
        };
        request.open("GET", "views/keyboard_shortcuts.html", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(null);
    };

}
