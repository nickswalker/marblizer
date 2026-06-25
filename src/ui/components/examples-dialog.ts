import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";
import {ExampleScript, examples} from "../../scripting/example_scripts.js";

// Modal list of starter scripts, opened from the script editor's "Load
// example" button. Resolves the promise returned by ask() with the chosen
// example, or null if the dialog was dismissed without a choice — mirroring
// the callback-based getInput() pattern ScriptingPane itself already uses,
// just promise-shaped since there's no polling main-thread caller here.
export default class ExamplesDialog extends Overlay {
    static styles = [
        Overlay.styles,
        css`
            p {
                margin: 0 0 var(--space-md, 12px);
            }

            ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }

            .example {
                display: block;
                width: 100%;
                padding: var(--space-sm, 8px) 0;
                background: none;
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.12);
                color: inherit;
                font-family: inherit;
                font-size: inherit;
                text-align: left;
                cursor: pointer;
            }

            .example:hover, .example:focus-visible {
                background-color: var(--color-button-hover-bg, rgba(255, 255, 255, 0.1));
            }

            .title {
                font-weight: 600;
            }

            .desc {
                opacity: 0.9;
            }
        `,
    ];

    private resolve: ((example: ExampleScript | null) => void) | null = null;

    protected heading(): string {
        return "Load example";
    }

    ask(): Promise<ExampleScript | null> {
        this.show();
        return new Promise((resolve) => {
            this.resolve = resolve;
        });
    }

    protected willDismiss() {
        this.resolve?.(null);
        this.resolve = null;
    }

    private choose(example: ExampleScript) {
        const resolve = this.resolve;
        this.resolve = null;
        this.hide();
        resolve?.(example);
    }

    protected content(): TemplateResult {
        return html`
            <p>Replace the script editor's contents with a starter script.</p>
            <ul>
                ${examples.map((example) => html`
                    <li>
                        <button type="button" class="example" @click=${() => this.choose(example)}>
                            <div class="title">${example.title}</div>
                            <div class="desc">${example.description}</div>
                        </button>
                    </li>
                `)}
            </ul>
        `;
    }
}

customElements.define("marbling-examples-dialog", ExamplesDialog);
