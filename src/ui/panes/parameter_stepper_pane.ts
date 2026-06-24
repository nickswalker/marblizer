import ToolParameters, {guideFor, primaryKeyFor, secondaryKeyFor, Tool} from "../tools.js";

// Touch/non-keyboard affordance for the parameters that are otherwise only
// reachable via mouse-wheel or arrow keys (drop radius, comb spacing, etc).
// Mirrors increase/decreasePrimary/Secondary on ToolParameters, the same
// methods the wheel/keyboard paths already call.
export default class ParameterStepperPane {
    private toolParameters: ToolParameters;
    private currentTool: Tool = Tool.Drop;

    private primaryRow: HTMLElement;
    private primaryLabel: HTMLElement;
    private primaryMinus: HTMLButtonElement;
    private primaryPlus: HTMLButtonElement;
    private secondaryRow: HTMLElement;
    private secondaryLabel: HTMLElement;
    private secondaryMinus: HTMLButtonElement;
    private secondaryPlus: HTMLButtonElement;

    constructor(container: HTMLElement, toolParameters: ToolParameters) {
        this.toolParameters = toolParameters;

        const primary = this.buildRow(
            () => this.toolParameters.decreasePrimary(this.currentTool),
            () => this.toolParameters.increasePrimary(this.currentTool),
        );
        this.primaryRow = primary.row;
        this.primaryLabel = primary.label;
        this.primaryMinus = primary.minus;
        this.primaryPlus = primary.plus;

        const secondary = this.buildRow(
            () => this.toolParameters.decreaseSecondary(this.currentTool),
            () => this.toolParameters.increaseSecondary(this.currentTool),
        );
        this.secondaryRow = secondary.row;
        this.secondaryLabel = secondary.label;
        this.secondaryMinus = secondary.minus;
        this.secondaryPlus = secondary.plus;

        container.appendChild(this.primaryRow);
        container.appendChild(this.secondaryRow);

        document.addEventListener("toolchange", this.toolChange.bind(this) as EventListener);
        this.toolChange({detail: {currentTool: this.currentTool}} as CustomEvent);
    }

    private buildRow(onDecrease: () => void, onIncrease: () => void): { row: HTMLElement, label: HTMLElement, minus: HTMLButtonElement, plus: HTMLButtonElement } {
        const row = document.createElement("div");
        row.className = "stepper-row";

        const label = document.createElement("span");
        label.className = "label";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        minus.onclick = onDecrease;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.onclick = onIncrease;

        row.appendChild(minus);
        row.appendChild(label);
        row.appendChild(plus);
        return {row, label, minus, plus};
    }

    private toolChange(e: CustomEvent) {
        this.currentTool = e.detail.currentTool;

        const primaryKey = primaryKeyFor(this.currentTool);
        this.primaryRow.style.display = primaryKey == null ? "none" : "";
        if (primaryKey != null) {
            this.primaryLabel.textContent = primaryKey;
            this.updateStepperButtons(primaryKey, this.primaryMinus, this.primaryPlus);
        }

        const secondaryKey = secondaryKeyFor(this.currentTool);
        this.secondaryRow.style.display = secondaryKey == null ? "none" : "";
        if (secondaryKey != null) {
            this.secondaryLabel.textContent = secondaryKey;
            this.updateStepperButtons(secondaryKey, this.secondaryMinus, this.secondaryPlus);
        }
    }

    private updateStepperButtons(key: string, minus: HTMLButtonElement, plus: HTMLButtonElement) {
        minus.title = `Decrease ${key}`;
        plus.title = `Increase ${key}`;

        const value = this.toolParameters.forTool(this.currentTool)[key];
        const [min, max] = guideFor(this.currentTool, key);
        minus.disabled = value <= min;
        plus.disabled = value >= max;
    }
}
