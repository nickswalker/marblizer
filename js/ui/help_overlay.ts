var KeyboardShortcutOverlay = (function () {
    function KeyboardShortcutOverlay() {
        this.container = document.createElement("div");
        this.container.className = "modal-container";
        document.body.insertBefore(this.container, document.body.firstChild);
        this.modal = document.createElement("div");
        this.container.appendChild(this.modal);
        this.modal.className = "keyboard-shortcut-overlay center-pane marbling-pane";
        this.fetchContent();
        this.hide();
        this.container.onclick = this.hide.bind(this);
    }

    KeyboardShortcutOverlay.prototype.show = function () {
        this.container.removeAttribute("style");
    };
    KeyboardShortcutOverlay.prototype.hide = function () {
        this.container.style.visibility = "hidden";
        this.container.style.display = "none";
    };
    KeyboardShortcutOverlay.prototype.handleResponse = function (e) {
        var response = e.currentTarget;
        if (response.readyState === 4) {
            if (response.status === 200 || response.status === 304) {
                this.modal.innerHTML += response.responseText;
                this.modal.querySelector(".close-button").addEventListener("click", this.hide.bind(this));
            }
        }
    };
    KeyboardShortcutOverlay.prototype.fetchContent = function () {
        var request = new XMLHttpRequest();
        request.onreadystatechange = this.handleResponse.bind(this);
        request.open("POST", "views/keyboard_shortcuts.html", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(null);
    };
    return KeyboardShortcutOverlay;
}());
