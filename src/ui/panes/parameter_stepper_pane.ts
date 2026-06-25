import ToolParameters, {descriptionFor, guideFor, parameterKeysFor, Tool} from "../tools.js";
import ToolsPane from "./toolspane.js";

// Most parameters a tool can have at once; bump this if a tool ever needs more.
const MAX_PARAMETER_ROWS = 3;

// Must match the "narrow/portrait" breakpoint in style.css, which is what
// flips the toolbar from a right-edge column to a bottom-edge row.
const NARROW_LAYOUT_QUERY = "(max-width: 700px)";

// Touch/non-keyboard affordance for the parameters that are otherwise only
// reachable via mouse-wheel or arrow keys (drop radius, comb spacing, etc).
// Mirrors increase/decreasePrimary/Secondary on ToolParameters, the same
// methods the wheel/keyboard paths already call.
//
// Rendered as a floating popover anchored to whichever tool button is
// active (rather than a permanently-reserved strip in the toolbar), opening
// away from whichever screen edge the toolbar itself is docked to: beside
// the button for the right-edge desktop column, above it for the
// bottom-edge mobile row. Hidden entirely for tools with no parameters
// (e.g. Vortex).
export default class ParameterStepperPane {
    private toolParameters: ToolParameters;
    private toolsPane: ToolsPane;
    private panel: HTMLElement;
    private currentTool: Tool = Tool.Drop;
    private isOpen: boolean = false;

    private rows: { row: HTMLElement, label: HTMLElement, value: HTMLElement, minus: HTMLButtonElement, plus: HTMLButtonElement, key: string | null }[] = [];

    constructor(panel: HTMLElement, toolParameters: ToolParameters, toolsPane: ToolsPane) {
        this.panel = panel;
        this.toolParameters = toolParameters;
        this.toolsPane = toolsPane;

        // Move out of the toolbar's flow/clipping so it can float over the
        // canvas instead of pushing toolbar content around.
        document.body.appendChild(this.panel);

        for (let i = 0; i < MAX_PARAMETER_ROWS; i++) {
            const built = this.buildRow();
            this.rows.push(built);
            this.panel.appendChild(built.row);
        }

        document.addEventListener("toolchange", this.toolChange.bind(this) as EventListener);
        window.addEventListener("resize", this.reposition.bind(this));
        this.toolChange({detail: {currentTool: this.currentTool}} as CustomEvent);
    }

    // Each row is built once and reused across tools; which parameter `key`
    // it currently drives is set in `toolChange`, with +/- reading it at
    // click-time rather than being bound to a key up front.
    private buildRow(): { row: HTMLElement, label: HTMLElement, value: HTMLElement, minus: HTMLButtonElement, plus: HTMLButtonElement, key: string | null } {
        const row = document.createElement("div");
        row.className = "stepper-row";

        const info = document.createElement("div");
        info.className = "param-info";

        const label = document.createElement("span");
        label.className = "label";

        const value = document.createElement("span");
        value.className = "value";

        info.appendChild(label);
        info.appendChild(value);

        const controls = document.createElement("div");
        controls.className = "param-controls";

        const built = {row, label, value, minus: null as unknown as HTMLButtonElement, plus: null as unknown as HTMLButtonElement, key: null as string | null};

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.onclick = () => {
            if (built.key != null) {
                this.toolParameters.decrease(this.currentTool, built.key);
            }
        };

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.onclick = () => {
            if (built.key != null) {
                this.toolParameters.increase(this.currentTool, built.key);
            }
        };

        controls.appendChild(minus);
        controls.appendChild(plus);

        row.appendChild(info);
        row.appendChild(controls);
        built.minus = minus;
        built.plus = plus;
        return built;
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;
        const reselected = e.detail.reselected === true;

        const keys = parameterKeysFor(this.currentTool);
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            const key = keys[i] ?? null;
            row.key = key;
            row.row.style.display = key == null ? "none" : "";
            if (key != null) {
                row.label.textContent = key;
                row.label.title = descriptionFor(key) ?? "";
                this.updateStepperButtons(key, row.value, row.minus, row.plus);
            }
        }

        if (keys.length === 0) {
            this.close();
        } else if (reselected) {
            // Tapping the already-active tool again toggles the popover,
            // rather than re-opening a panel the user just dismissed.
            this.isOpen ? this.close() : this.open();
        } else {
            this.open();
        }
    }

    private open() {
        this.isOpen = true;
        this.panel.classList.add("open");
        this.reposition();
    }

    private close() {
        this.isOpen = false;
        this.panel.classList.remove("open");
    }

    private reposition() {
        if (!this.isOpen) {
            return;
        }
        const button = this.toolsPane.toolToButtonMapping[this.currentTool];
        if (button == null) {
            return;
        }
        const toolbarPanel = button.closest(".marbling-pane");
        const buttonRect = button.getBoundingClientRect();
        const toolbarRect = toolbarPanel?.getBoundingClientRect() ?? buttonRect;
        const panelRect = this.panel.getBoundingClientRect();
        const margin = 8;

        if (window.matchMedia(NARROW_LAYOUT_QUERY).matches) {
            // Bottom-edge toolbar: open above the whole toolbar (not just the
            // button), left-aligned to the button.
            let left = buttonRect.left;
            left = Math.max(margin, Math.min(left, window.innerWidth - panelRect.width - margin));
            this.panel.style.left = `${left}px`;
            this.panel.style.top = `${toolbarRect.top - panelRect.height - margin}px`;
        } else {
            // Right-edge toolbar: open beside the whole toolbar (not just the
            // button), top-aligned to the button.
            let top = buttonRect.top;
            top = Math.max(margin, Math.min(top, window.innerHeight - panelRect.height - margin));
            this.panel.style.top = `${top}px`;
            this.panel.style.left = `${toolbarRect.left - panelRect.width - margin}px`;
        }
    }

    private updateStepperButtons(key: string, valueEl: HTMLElement, minus: HTMLButtonElement, plus: HTMLButtonElement) {
        minus.title = `Decrease ${key}`;
        plus.title = `Increase ${key}`;

        const value = this.toolParameters.forTool(this.currentTool)[key];
        valueEl.textContent = String(value);
        const [min, max] = guideFor(this.currentTool, key);
        minus.disabled = value <= min;
        plus.disabled = value >= max;
    }
}
