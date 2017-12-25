import {MarblingRendererDelegate, MarblingUIDelegate} from "../ui.js";

export enum ButtonBehavior {
    Toggle,
    Temporary
}

export enum UICommand {
    Save,
    ShowField,
    ShowScriptEditor,
    ShowHelp,
    Reset,
    ShowKeyboardShortcutOverlay
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
        const showFieldButton = <HTMLElement>container.querySelector(".show-field");
        const showScriptEditor = <HTMLElement>container.querySelector(".show-script-editor");
        const helpButton = <HTMLElement>container.querySelector(".help");
        const resetButton = <HTMLElement>container.querySelector(".reset");
        const keyboardShortcutsButton = <HTMLElement>container.querySelector(".show-keyboard-shortcuts");
        this.optionToButtonMapping = {};
        this.buttonBehaviors = {};
        this.optionToButtonMapping[UICommand.Save] = saveButton;
        this.buttonBehaviors[UICommand.Save] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ShowField] = showFieldButton;
        this.buttonBehaviors[UICommand.ShowField] = ButtonBehavior.Toggle;
        this.optionToButtonMapping[UICommand.ShowScriptEditor] = showScriptEditor;
        this.buttonBehaviors[UICommand.ShowScriptEditor] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ShowHelp] = helpButton;
        this.buttonBehaviors[UICommand.ShowHelp] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.Reset] = resetButton;
        this.buttonBehaviors[UICommand.Reset] = ButtonBehavior.Temporary;
        this.optionToButtonMapping[UICommand.ShowKeyboardShortcutOverlay] = keyboardShortcutsButton;
        this.buttonBehaviors[UICommand.ShowKeyboardShortcutOverlay] = ButtonBehavior.Temporary;

        for (const key in this.optionToButtonMapping) {
            this.optionToButtonMapping[key].onclick = this.optionClicked.bind(this);
        }
        document.addEventListener("keydown", this.shiftChange.bind(this));
        document.addEventListener("keyup", this.shiftChange.bind(this));
    }

    private shiftChange(e: KeyboardEvent) {
        this.shiftDown = e.shiftKey;
    }

    private optionClicked(event: MouseEvent) {
        const target = event.currentTarget;
        let option;
        for (let key in this.optionToButtonMapping) {
            if (this.optionToButtonMapping[key] == target) {
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