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
    V = 8,
    F = 9,
    B = 10,
    Q = 11
}

const keyMapping = {
    "=": KeyboardShortcut.Plus,
    "-": KeyboardShortcut.Minus,
    "s": KeyboardShortcut.S,
    "r": KeyboardShortcut.R,
    "d": KeyboardShortcut.D,
    "l": KeyboardShortcut.L,
    "c": KeyboardShortcut.C,
    "q": KeyboardShortcut.Q,
    "w": KeyboardShortcut.W,
    "v": KeyboardShortcut.V,
    "f": KeyboardShortcut.F,
    "b": KeyboardShortcut.B
};;;;;;;;;;;;;;;;;;;;;;;;;;

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
        if (!this.acceptingNewKeys) {
            return;
        }
        const shortcut = keyMapping[event.key];
        this.keyboardDelegate.didPressShortcut(shortcut);
    }



}