export interface Shortcut {
    keys: string[];
    sep?: string;
    def: string;
}

export interface ShortcutSection {
    title: string;
    shortcuts: Shortcut[];
}

export const shortcutSections: ShortcutSection[] = [
    {
        title: "Tools",
        shortcuts: [
            {keys: ["D"], def: "Ink drop"},
            {keys: ["X"], def: "Spatter"},
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
            {keys: ["Ctrl", "Z"], def: "Undo"},
            {keys: ["Ctrl", "Shift", "Z"], def: "Redo"},
            {keys: ["S"], def: "Script editor"},
            {keys: ["R"], def: "Reset composition"},
        ],
    },
    {
        title: "View",
        shortcuts: [
            {keys: ["F"], def: "Toggle force-field preview"},
            {keys: ["F11"], def: "Toggle fullscreen"},
            {keys: ["[", "]"], sep: " / ", def: "Force-field density"},
            {keys: ["Shift", "?"], def: "Show help"},
        ],
    },
];
