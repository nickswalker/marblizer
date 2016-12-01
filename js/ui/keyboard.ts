///<reference path="ui.ts"/>
///<reference path="panes.ts"/>
///<reference path="../operations/parsing.ts"/>

enum KeyboardShortcut {
    Plus = 0,
    Minus = 1,
    S = 2,
    R = 3,
    D = 4,
    L = 5,
    C = 6,
    W = 7,
    V = 8
}

interface MarblingKeyboardUIDelegate {
    didPressShortcut(shortcut: KeyboardShortcut)
}

class MarblingKeyboardUI {
    keyboardDelegate: MarblingKeyboardUIDelegate;
    acceptingNewKeys: boolean = true;

    constructor() {
        window.onkeypress = this.keyWasPressed.bind(this);

    }

    keyWasPressed(event: KeyboardEvent) {
        if (this.acceptingNewKeys) {
            return;
        }
        switch (event.key) {
            case "s":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.S);
                return;
            case "+":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.Plus);
                return;
            case "-":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.Minus);
                return;
            case "r":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.R);
                return;
            case "d":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.D);
                return;
            case "l":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.L);
                return;
            case "c":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.C);
                return;
            case "w":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.W);
                return;
            case "v":
                this.keyboardDelegate.didPressShortcut(KeyboardShortcut.V);
                return;

        }
    }



}