import {css, CSSResultGroup, html, LitElement, TemplateResult} from "lit";

// Base class for the app's modal overlays (help, keyboard shortcuts,
// notifications). Provides the scrim, a centered pane, a close button, and the
// usual dismiss affordances (click the scrim or press Escape). Subclasses fill
// in a heading and the body content.
//
// Theme colors come from CSS custom properties defined on :root in style.css;
// custom properties pierce the shadow boundary, so the overlays stay in sync
// with the rest of the UI without duplicating the palette.
export default abstract class Overlay extends LitElement {
    static properties = {
        open: {type: Boolean, reflect: true},
    };

    open = false;

    private downOnScrim = false;
    private readonly onKeyDown = (e: KeyboardEvent) => {
        if (this.open && e.key === "Escape") {
            this.hide();
        }
    };

    static styles: CSSResultGroup = css`
        :host {
            display: none;
        }

        :host([open]) {
            display: block;
        }

        .scrim {
            position: fixed;
            inset: 0;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--color-overlay-scrim, rgba(0, 0, 0, 0.4));
            backdrop-filter: var(--overlay-backdrop-filter, blur(6px));
            -webkit-backdrop-filter: var(--overlay-backdrop-filter, blur(6px));
        }

        .pane {
            position: relative;
            box-sizing: border-box;
            width: 80%;
            max-width: 720px;
            max-height: 85vh;
            overflow-y: auto;
            padding: var(--space-lg, 24px) calc(var(--space-lg, 24px) + 4px);
            background-color: var(--color-pane-bg, rgba(30, 30, 30, 0.85));
            color: var(--color-pane-text, #eeeeee);
            backdrop-filter: var(--pane-backdrop-filter, blur(14px) saturate(135%));
            -webkit-backdrop-filter: var(--pane-backdrop-filter, blur(14px) saturate(135%));
            border-radius: var(--radius, 4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
            font-family: var(--font-ui, sans-serif);
            line-height: 1.5;
        }

        .close {
            position: absolute;
            top: var(--space-md, 12px);
            right: var(--space-md, 12px);
            padding: 0;
            background: none;
            border: none;
            color: inherit;
            font-size: 1.8em;
            line-height: 1;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.15s linear;
        }

        .close:hover {
            opacity: 1;
        }

        h1 {
            margin: 0 0 var(--space-md, 12px);
            font-size: 1.6em;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("keydown", this.onKeyDown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("keydown", this.onKeyDown);
    }

    show() {
        this.open = true;
    }

    hide() {
        if (!this.open) {
            return;
        }
        this.open = false;
        this.willDismiss();
        this.dispatchEvent(new CustomEvent("dismiss"));
    }

    // Hook for subclasses; called once when the overlay is dismissed.
    protected willDismiss() {
    }

    protected abstract heading(): string;

    protected abstract content(): TemplateResult;

    private scrimDown(e: MouseEvent) {
        this.downOnScrim = e.target === e.currentTarget;
    }

    private scrimUp(e: MouseEvent) {
        if (e.target === e.currentTarget && this.downOnScrim) {
            this.hide();
        }
        this.downOnScrim = false;
    }

    render() {
        return html`
            <div class="scrim" @mousedown=${this.scrimDown} @mouseup=${this.scrimUp}>
                <div class="pane">
                    <button class="close" title="Close" @click=${() => this.hide()}>&times;</button>
                    <h1>${this.heading()}</h1>
                    ${this.content()}
                </div>
            </div>
        `;
    }
}
