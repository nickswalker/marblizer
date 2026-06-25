import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";

export type DiscardChangesChoice = "download" | "discard" | "cancel";

// Confirms before an example overwrites whatever the user has typed into the
// script editor. Three-way choice (rather than a plain confirm()) because
// "discard" and "save first" are both reasonable answers here, unlike the
// simple yes/no confirm("Clear the composition?") the canvas reset button
// uses elsewhere in the app.
export default class DiscardChangesDialog extends Overlay {
    static styles = [
        Overlay.styles,
        css`
            p {
                margin: 0 0 var(--space-lg, 24px);
            }

            .actions {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: var(--space-sm, 8px);
            }

            button {
                padding: var(--space-sm, 8px) var(--space-md, 12px);
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: var(--radius, 4px);
                color: inherit;
                font-family: inherit;
                font-size: inherit;
                cursor: pointer;
            }

            button:hover {
                border-color: var(--color-button-hover-border, gray);
                background-color: var(--color-button-hover-bg, rgba(255, 255, 255, 0.1));
            }

            button.primary {
                border-color: var(--color-accent, rgb(72, 151, 170));
                background-color: var(--color-accent-translucent, rgba(72, 151, 170, 0.6));
            }
        `,
    ];

    private resolve: ((choice: DiscardChangesChoice) => void) | null = null;

    protected heading(): string {
        return "Unsaved changes";
    }

    ask(): Promise<DiscardChangesChoice> {
        this.show();
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    protected willDismiss() {
        this.resolve?.("cancel");
        this.resolve = null;
    }

    private choose(choice: Exclude<DiscardChangesChoice, "cancel">) {
        const resolve = this.resolve;
        this.resolve = null;
        this.hide();
        resolve?.(choice);
    }

    protected content(): TemplateResult {
        return html`
            <p>Loading this example will replace the script you're currently editing.</p>
            <div class="actions">
                <button type="button" @click=${() => this.hide()}>Cancel</button>
                <button type="button" @click=${() => this.choose("discard")}>Continue without saving</button>
                <button type="button" class="primary" @click=${() => this.choose("download")}>Download &amp; continue</button>
            </div>
        `;
    }
}

customElements.define("marbling-discard-changes-dialog", DiscardChangesDialog);
