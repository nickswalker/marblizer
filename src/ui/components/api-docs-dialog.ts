import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";

interface ApiEntry {
    signature: string;
    description: string;
}

interface ApiSection {
    title: string;
    entries: ApiEntry[];
}

const globals: ApiSection[] = [
    {
        title: "Vec2",
        entries: [
            {signature: "new Vec2(x, y)", description: "A 2D point or vector. Used as the position argument to every operation."},
        ],
    },
    {
        title: "Color",
        entries: [
            {signature: "new Color(r, g, b, a = 1.0)", description: "An RGBA color, components 0–255 (alpha 0–1)."},
            {signature: "Color.withHex(hex)", description: "Parses a #rrggbb (or rrggbb) string into a Color, or null if it doesn't match."},
            {signature: "Color.withRGB(\"rgb(r, g, b)\")", description: "Parses an rgb(...) string into a Color, or null if it doesn't match."},
        ],
    },
    {
        title: "colorSets",
        entries: [
            {signature: "colorSets", description: "An array of 4 preset palettes, each an array of 5 Colors, matching the app's built-in color sets."},
        ],
    },
    {
        title: "InkDropOperation",
        entries: [
            {signature: "new InkDropOperation(position, radius, color, displacing = true)", description: "Deposits a disc of ink at position, pushing the existing field outward unless displacing is false."},
        ],
    },
    {
        title: "LineTine",
        entries: [
            {signature: "new LineTine(origin, direction, numTines, spacing)", description: "Rakes a straight comb through the field, starting at origin along direction."},
        ],
    },
    {
        title: "WavyLineTine",
        entries: [
            {signature: "new WavyLineTine(origin, direction, numTines, spacing)", description: "Like LineTine, but the comb follows a wave for a rippled pattern."},
        ],
    },
    {
        title: "CircularLineTine",
        entries: [
            {signature: "new CircularLineTine(origin, radius, numTines, interval, counterClockwise = false)", description: "Rakes the field around a circle centered at origin."},
        ],
    },
    {
        title: "Vortex",
        entries: [
            {signature: "new Vortex(origin, radius, counterclockwise = false)", description: "Swirls the field around origin into a spiral."},
        ],
    },
    {
        title: "ChangeBaseColorOperation",
        entries: [
            {signature: "new ChangeBaseColorOperation(color)", description: "Changes the background/base color of the composition to color."},
        ],
    },
];

const context: ApiSection = {
    title: "Script context (this)",
    entries: [
        {signature: "this.canvasWidth, this.canvasHeight", description: "The current canvas size in pixels."},
        {signature: "this.history", description: "The array of operations already applied to the composition, oldest first. Use instanceof to filter by operation type."},
        {signature: "this.foregroundColor, this.backgroundColor", description: "The Colors currently selected in the foreground/background swatches."},
        {signature: "await this.colorAt(point)", description: "Reads back the rendered Color at a single Vec2 point, or null if it's outside the canvas."},
        {signature: "await this.colorsAt(points)", description: "Reads back the rendered Color at each point in an array of Vec2s in a single round trip, useful for sampling a region."},
    ],
};

export default class ApiDocsDialog extends Overlay {
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

            .entry {
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: var(--space-sm, 8px) 0;
                border-top: 1px solid rgba(255, 255, 255, 0.12);
            }

            .signature {
                font-family: monospace;
                font-weight: 600;
            }

            .desc {
                opacity: 0.9;
            }
        `,
    ];

    protected heading(): string {
        return "Scripting API";
    }

    private renderSection(section: ApiSection): TemplateResult {
        return html`
            <h2>${section.title}</h2>
            <ul>
                ${section.entries.map((entry) => html`
                    <li class="entry">
                        <span class="signature">${entry.signature}</span>
                        <span class="desc">${entry.description}</span>
                    </li>
                `)}
            </ul>
        `;
    }

    protected content(): TemplateResult {
        return html`
            <p>
                A script is a JavaScript function body that returns an array of
                operations. It may be async and use await. The following globals
                and context members are available to it.
            </p>
            ${this.renderSection(context)}
            ${globals.map((section) => this.renderSection(section))}
        `;
    }
}

customElements.define("marbling-api-docs-dialog", ApiDocsDialog);
