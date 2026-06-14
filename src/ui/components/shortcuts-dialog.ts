import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";

interface Shortcut {
    keys: string[];
    // Separator rendered between keys, e.g. " + " for chords or " / " for
    // alternatives. Defaults to " + ".
    sep?: string;
    def: string;
}

interface ShortcutSection {
    title: string;
    shortcuts: Shortcut[];
}

// Authoritative list of the shortcuts the app actually implements (see
// MarblingUI.didPressShortcut). Kept here as data so the overlay can't drift
// out of sync the way the old hand-written HTML table did.
const sections: ShortcutSection[] = [
    {
        title: "Tools",
        shortcuts: [
            {keys: ["D"], def: "Ink drop"},
            {keys: ["L"], def: "Line tine"},
            {keys: ["C"], def: "Circular tine"},
            {keys: ["W"], def: "Wavy tine"},
            {keys: ["V"], def: "Vortex"},
        ],
    },
    {
        title: "Adjust current tool",
        shortcuts: [
            {keys: ["▲", "▼"], sep: " / ", def: "Primary parameter (or scroll)"},
            {keys: ["◀", "▶"], sep: " / ", def: "Secondary parameter (or Shift + scroll)"},
        ],
    },
    {
        title: "Composition",
        shortcuts: [
            {keys: ["Ctrl", "S"], def: "Save image"},
            {keys: ["S"], def: "Script editor"},
            {keys: ["R"], def: "Reset composition"},
        ],
    },
    {
        title: "View",
        shortcuts: [
            {keys: ["F"], def: "Toggle force-field preview"},
            {keys: ["[", "]"], sep: " / ", def: "Force-field density"},
            {keys: ["Shift", "?"], def: "Show this overlay"},
        ],
    },
];

export default class ShortcutsDialog extends Overlay {
    static styles = [
        Overlay.styles,
        css`
            .columns {
                columns: 2;
                column-gap: var(--space-lg, 24px);
            }

            section {
                break-inside: avoid;
                margin-bottom: var(--space-md, 12px);
            }

            h2 {
                margin: 0 0 var(--space-sm, 8px);
                font-size: 1.05em;
                font-weight: 600;
                opacity: 0.85;
            }

            ul {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            li {
                display: flex;
                align-items: baseline;
                gap: var(--space-md, 12px);
                padding: 3px 0;
            }

            .keys {
                flex: none;
                white-space: nowrap;
            }

            kbd {
                display: inline-block;
                min-width: 1em;
                padding: 1px 7px;
                font-family: var(--font-ui, sans-serif);
                font-size: 0.85em;
                text-align: center;
                color: #333;
                background: linear-gradient(#fbfbfb, #e7e7e7);
                border: 1px solid #bbb;
                border-radius: 3px;
                box-shadow: inset 0 1px 0 #fff, 0 1px 0 #bbb;
            }

            .def {
                opacity: 0.9;
            }
        `,
    ];

    protected heading(): string {
        return "Keyboard shortcuts";
    }

    private renderKeys(shortcut: Shortcut): TemplateResult {
        const sep = shortcut.sep ?? " + ";
        return html`<span class="keys">${shortcut.keys.map((key, i) => html`${i > 0 ? sep : ""}<kbd>${key}</kbd>`)}</span>`;
    }

    protected content(): TemplateResult {
        return html`
            <div class="columns">
                ${sections.map((section) => html`
                    <section>
                        <h2>${section.title}</h2>
                        <ul>
                            ${section.shortcuts.map((shortcut) => html`
                                <li>
                                    ${this.renderKeys(shortcut)}
                                    <span class="def">${shortcut.def}</span>
                                </li>
                            `)}
                        </ul>
                    </section>
                `)}
            </div>
        `;
    }
}

customElements.define("marbling-shortcuts-dialog", ShortcutsDialog);
