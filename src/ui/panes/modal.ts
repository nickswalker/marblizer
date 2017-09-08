abstract class Modal {
    container: HTMLElement;
    modal: HTMLElement;
    private downOnContainer: boolean = false;

    constructor() {
        this.container = document.createElement("div");
        this.container.className = "modal-container";
        document.body.appendChild(this.container);
        this.modal = document.createElement("div");
        this.container.appendChild(this.modal);
        this.modal.className = "center-pane marbling-pane";
        this.hide();
        this.container.onmouseup = this.upContainer.bind(this);
        this.container.onmousedown = this.downContainer.bind(this);

    }

    abstract willDismiss();

    show() {
        this.container.removeAttribute("style");
    }

    hide() {
        this.container.style.visibility = "hidden";
        this.container.style.display = "none";
    }

    private downContainer(event: MouseEvent) {
        this.downOnContainer = event.target == this.container;
    }

    private upContainer(event: MouseEvent) {
        if (event.target == this.container && this.downOnContainer) {
            this.hide();
            this.willDismiss();
        }
        this.downOnContainer = false;

    }

}
