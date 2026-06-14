import {MarblingRendererDelegate, MarblingUIDelegate} from "../ui.js";

export enum ButtonBehavior {
    Toggle,
    Temporary
}

export enum UICommand {
    Save,
    SaveSVG,
    ShowField,
    ShowScriptEditor,
    ShowHelp,
    Reset,
    Undo,
    Redo,
    ToggleFullscreen
}

export default class ControlsPane {
    container: HTMLElement;
    optionToButtonMapping: { [key: number]: HTMLElement };
    buttonBehaviors: { [key: number]: ButtonBehavior };
    delegate: MarblingRendererDelegate;
    uiDelegate: MarblingUIDelegate;
    private shiftDown: boolean = false;

    constructor(container: HTMLElement) {
        this.container = container;
        const saveButton = <HTMLElement>container.querySelector(".save-image");
        const saveSVGButton = <HTMLElement>container.querySelector(".save-svg");
        const showFieldButton = <HTMLElement>container.querySelector(".show-field");
        const showScriptEditor = <HTMLElement>container.querySelector(".show-script-editor");
        const undoButton = <HTMLElement>container.querySelector(".undo");
        const redoButton = <HTMLElement>container.querySelector(".redo");
        const fullscreenButton = <HTMLElement>container.querySelector(".fullscreen");
        const helpButton = <HTMLElement>container.querySelector(".help");
        const resetButton = <HTMLElement>container.querySelector(".reset");
        this.optionToButtonMapping = {};
        this.buttonBehaviors = {};
        this.optionToButtonMapping[UICommand.Save] = saveButton;
        this.buttonBehaviors[UICommand.Save] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.SaveSVG] = saveSVGButton;
        this.buttonBehaviors[UICommand.SaveSVG] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ShowField] = showFieldButton;
        this.buttonBehaviors[UICommand.ShowField] = ButtonBehavior.Toggle;
        this.optionToButtonMapping[UICommand.ShowScriptEditor] = showScriptEditor;
        this.buttonBehaviors[UICommand.ShowScriptEditor] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.Undo] = undoButton;
        this.buttonBehaviors[UICommand.Undo] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.Redo] = redoButton;
        this.buttonBehaviors[UICommand.Redo] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ToggleFullscreen] = fullscreenButton;
        this.buttonBehaviors[UICommand.ToggleFullscreen] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ShowHelp] = helpButton;
        this.buttonBehaviors[UICommand.ShowHelp] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.Reset] = resetButton;
        this.buttonBehaviors[UICommand.Reset] = ButtonBehavior.Temporary;

        for (const key in this.optionToButtonMapping) {
            this.optionToButtonMapping[key].onclick = this.optionClicked.bind(this);
        }
        this.setHistoryState(false, false);
        document.addEventListener("keydown", this.shiftChange.bind(this));
        document.addEventListener("keyup", this.shiftChange.bind(this));
    }

    setHistoryState(canUndo: boolean, canRedo: boolean) {
        const undoButton = this.optionToButtonMapping[UICommand.Undo];
        const redoButton = this.optionToButtonMapping[UICommand.Redo];
        undoButton.classList.toggle("disabled", !canUndo);
        redoButton.classList.toggle("disabled", !canRedo);
        undoButton.setAttribute("aria-disabled", String(!canUndo));
        redoButton.setAttribute("aria-disabled", String(!canRedo));
    }

    private shiftChange(e: KeyboardEvent) {
        this.shiftDown = e.shiftKey;
    }

    private optionClicked(event: MouseEvent) {
        const target = event.currentTarget;
        let option;
        for (let key in this.optionToButtonMapping) {
            if (this.optionToButtonMapping[key] == target) {
                if (this.optionToButtonMapping[key].className.match("disabled")) {
                    return;
                }
                option = <UICommand>parseInt(key);
                if (this.buttonBehaviors[key] == ButtonBehavior.Temporary) {
                    break;
                }
                if (this.optionToButtonMapping[key].className.match("active")) {
                    let newClasses = this.optionToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
                    this.optionToButtonMapping[key].className = newClasses;
                } else {
                    this.optionToButtonMapping[key].className += " active";
                }

            }
        }
        this.uiDelegate.applyCommand(option);
    }


}
