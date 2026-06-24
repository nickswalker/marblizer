import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";
import {Tool} from "../tools.js";
import {toolKeys} from "../keyboard.js";
import {Shortcut, shortcutSections} from "../shortcuts.js";

interface ToolHelp {
    tool: Tool;
    name: string;
    description: string;
}

const tools: ToolHelp[] = [
    {tool: Tool.Drop, name: "Ink drop", description: "Click to drop a disc of ink. It pushes the existing ink outward, the way a real drop spreads on water. Hold Shift to lay ink down without displacing what's underneath."},
    {tool: Tool.Spatter, name: "Spatter", description: "Press and drag to fling a scatter of small droplets across the surface."},
    {tool: Tool.TineLine, name: "Line tine", description: "Drag to rake a straight comb through the ink, dragging the pattern along with it."},
    {tool: Tool.WavyLine, name: "Wavy tine", description: "Like the line tine, but the rake follows a wave for a rippled comb."},
    {tool: Tool.CircularTine, name: "Circular tine", description: "Drag out from a center point to rake the ink around a circle."},
    {tool: Tool.Vortex, name: "Vortex", description: "Drag to swirl the ink around a point into a spiral."},
];

function keyFor(tool: Tool): string | undefined {
    return toolKeys[tool];
}

export default class HelpDialog extends Overlay {
    static styles = [
        Overlay.styles,
        css`
            p {
                margin: 0 0 var(--space-md, 12px);
            }

            h2 {
                margin: var(--space-lg, 24px) 0 var(--space-sm, 8px);
                font-size: 1.15em;
            }

            ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }

            .tool {
                display: flex;
                gap: var(--space-md, 12px);
                padding: var(--space-sm, 8px) 0;
                border-top: 1px solid rgba(255, 255, 255, 0.12);
            }

            .tool .name {
                flex: 0 0 7.5em;
                font-weight: 600;
            }

            kbd {
                display: inline-block;
                min-width: 1em;
                margin-left: var(--space-sm, 8px);
                padding: 1px 7px;
                font-family: var(--font-ui, sans-serif);
                font-size: 0.8em;
                color: #333;
                background: linear-gradient(#fbfbfb, #e7e7e7);
                border: 1px solid #bbb;
                border-radius: 3px;
                box-shadow: inset 0 1px 0 #fff, 0 1px 0 #bbb;
            }

            .desc {
                flex: 1;
                opacity: 0.9;
            }

            .shortcut-grid {
                columns: 2;
                column-gap: var(--space-lg, 24px);
            }

            section {
                break-inside: avoid;
                margin-bottom: var(--space-md, 12px);
            }

            .shortcut {
                display: flex;
                align-items: baseline;
                gap: var(--space-md, 12px);
                padding: 3px 0;
            }

            .keys {
                flex: none;
                white-space: nowrap;
            }

            .about {
                margin-top: var(--space-lg, 24px);
                padding-top: var(--space-md, 12px);
                border-top: 1px solid rgba(255, 255, 255, 0.12);
                font-size: 0.92em;
                opacity: 0.82;
            }

            a {
                color: var(--color-accent, rgb(72, 151, 170));
            }
        `,
    ];

    protected heading(): string {
        return "Marblizer";
    }

    private renderKeys(shortcut: Shortcut): TemplateResult {
        const sep = shortcut.sep ?? " + ";
        return html`<span class="keys">${shortcut.keys.map((key, i) => html`${i > 0 ? sep : ""}<kbd>${key}</kbd>`)}</span>`;
    }

    protected content(): TemplateResult {
        return html`
            <p>
                Marbling is the art of floating ink on a liquid surface, raking it
                into patterns, and lifting the result onto paper. Marblizer
                simulates that surface so you can play with the same tools.
            </p>

            <h2>Tools</h2>
            <p>Pick a tool from the palette on the right, then work on the canvas.</p>
            <ul>
                ${tools.map((tool) => {
                    const key = keyFor(tool.tool);
                    return html`
                        <li class="tool">
                            <div class="name">
                                ${tool.name}${key ? html`<kbd>${key.toUpperCase()}</kbd>` : ""}
                            </div>
                            <div class="desc">${tool.description}</div>
                        </li>
                    `;
                })}
            </ul>

            <h2>Tuning a tool</h2>
            <p>
                Scroll the mouse wheel to change the active tool's primary
                parameter (such as drop size or comb spacing), and Shift + scroll
                for its secondary parameter. The arrow keys do the same thing.
            </p>

            <h2>Color</h2>
            <p>
                The two swatches at the bottom-left set the foreground and
                background ink. Recently used colors collect just beneath them.
            </p>

            <h2>Scripting</h2>
            <p>
                Open the script editor to drive operations with a small
                JavaScript API, then share a composition as a URL straight from
                the editor.
            </p>

            <h2>Saving</h2>
            <p>
                Save a PNG for a raster image, or save an SVG for editable vector
                paths generated from the current marbling operations.
            </p>

            <h2>Install as an app</h2>
            <p>Marblizer can be installed for a faster, full-screen experience with its own icon.</p>
            <ul>
                <li class="tool">
                    <div class="name">iOS</div>
                    <div class="desc">In Safari, tap the Share icon, then "Add to Home Screen".</div>
                </li>
                <li class="tool">
                    <div class="name">Android</div>
                    <div class="desc">In Chrome, tap the ⋮ menu, then "Install app" (or "Add to Home screen").</div>
                </li>
                <li class="tool">
                    <div class="name">macOS / Windows</div>
                    <div class="desc">In Chrome or Edge, click the install icon in the address bar, or open the menu and choose "Install Marblizer…".</div>
                </li>
            </ul>

            <h2>Keyboard shortcuts</h2>
            <div class="shortcut-grid">
                ${shortcutSections.map((section) => html`
                    <section>
                        <h2>${section.title}</h2>
                        <ul>
                            ${section.shortcuts.map((shortcut) => html`
                                <li class="shortcut">
                                    ${this.renderKeys(shortcut)}
                                    <span class="desc">${shortcut.def}</span>
                                </li>
                            `)}
                        </ul>
                    </section>
                `)}
            </div>

            <h2>About</h2>
            <p class="about">
                Marblizer was made by
                <a href="https://nickwalker.us/" target="_blank" rel="noopener">Nick Walker</a>.
                It is used thousands of times each year by visitors from across the world.
                The source code is on
                <a href="https://github.com/nickswalker/marblizer" target="_blank" rel="noopener">GitHub</a>.
            </p>
        `;
    }
}

customElements.define("marbling-help-dialog", HelpDialog);
