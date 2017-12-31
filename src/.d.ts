// Class
interface Path2D {
    addPath(path: Path2D, transform?: SVGMatrix);

    closePath(): void;

    moveTo(x: number, y: number): void;

    lineTo(x: number, y: number): void;

    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;

    /*ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;*/
    rect(x: number, y: number, w: number, h: number): void;
}

declare var $: any;
declare var LZString: any;

// Extend CanvasRenderingContext2D
interface CanvasRenderingContext2D {
    fill(path: Path2D): void;

    stroke(path: Path2D): void;

    clip(path: Path2D, fillRule?: string): void;
}

// Type definitions for CodeMirror
// Project: https://github.com/marijnh/CodeMirror
// Definitions by: mihailik <https://github.com/mihailik>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare function CodeMirror(host: HTMLElement, options?: CodeMirror.EditorConfiguration): CodeMirror.Editor;
declare function CodeMirror(callback: (host: HTMLElement) => void, options?: CodeMirror.EditorConfiguration): CodeMirror.Editor;

declare namespace CodeMirror {
    export var Doc: CodeMirror.DocConstructor;
    export var Pos: CodeMirror.PositionConstructor;
    export var Pass: any;

    function fromTextArea(host: HTMLTextAreaElement, options?: EditorConfiguration): CodeMirror.EditorFromTextArea;

    var version: string;

    /** If you want to define extra methods in terms of the CodeMirror API, it is possible to use defineExtension.
     This will cause the given value(usually a method) to be added to all CodeMirror instances created from then on. */
    function defineExtension(name: string, value: any): void;

    /** Like defineExtension, but the method will be added to the interface for Doc objects instead. */
    function defineDocExtension(name: string, value: any): void;

    /** Similarly, defineOption can be used to define new options for CodeMirror.
     The updateFunc will be called with the editor instance and the new value when an editor is initialized,
     and whenever the option is modified through setOption. */
    function defineOption(name: string, default_: any, updateFunc: Function): void;

    /** If your extention just needs to run some code whenever a CodeMirror instance is initialized, use CodeMirror.defineInitHook.
     Give it a function as its only argument, and from then on, that function will be called (with the instance as argument)
     whenever a new CodeMirror instance is initialized. */
    function defineInitHook(func: Function): void;

    /** Registers a helper value with the given name in the given namespace (type). This is used to define functionality
     that may be looked up by mode. Will create (if it doesn't already exist) a property on the CodeMirror object for
     the given type, pointing to an object that maps names to values. I.e. after doing
     CodeMirror.registerHelper("hint", "foo", myFoo), the value CodeMirror.hint.foo will point to myFoo. */
    function registerHelper(namespace: string, name: string, helper: any): void;


    function on(element: any, eventName: string, handler: Function): void;

    function off(element: any, eventName: string, handler: Function): void;

    /** Fired whenever a change occurs to the document. changeObj has a similar type as the object passed to the editor's "change" event,
     but it never has a next property, because document change events are not batched (whereas editor change events are). */
    function on(doc: Doc, eventName: 'change', handler: (instance: Doc, change: EditorChange) => void): void;

    function off(doc: Doc, eventName: 'change', handler: (instance: Doc, change: EditorChange) => void): void;

    /** See the description of the same event on editor instances. */
    function on(doc: Doc, eventName: 'beforeChange', handler: (instance: Doc, change: EditorChangeCancellable) => void): void;

    function off(doc: Doc, eventName: 'beforeChange', handler: (instance: Doc, change: EditorChangeCancellable) => void): void;

    /** Fired whenever the cursor or selection in this document changes. */
    function on(doc: Doc, eventName: 'cursorActivity', handler: (instance: CodeMirror.Editor) => void): void;

    function off(doc: Doc, eventName: 'cursorActivity', handler: (instance: CodeMirror.Editor) => void): void;

    /** Equivalent to the event by the same name as fired on editor instances. */
    function on(doc: Doc, eventName: 'beforeSelectionChange', handler: (instance: CodeMirror.Editor, selection: { head: Position; anchor: Position; }) => void): void;

    function off(doc: Doc, eventName: 'beforeSelectionChange', handler: (instance: CodeMirror.Editor, selection: { head: Position; anchor: Position; }) => void): void;

    /** Will be fired when the line object is deleted. A line object is associated with the start of the line.
     Mostly useful when you need to find out when your gutter markers on a given line are removed. */
    function on(line: LineHandle, eventName: 'delete', handler: () => void): void;

    function off(line: LineHandle, eventName: 'delete', handler: () => void): void;

    /** Fires when the line's text content is changed in any way (but the line is not deleted outright).
     The change object is similar to the one passed to change event on the editor object. */
    function on(line: LineHandle, eventName: 'change', handler: (line: LineHandle, change: EditorChange) => void): void;

    function off(line: LineHandle, eventName: 'change', handler: (line: LineHandle, change: EditorChange) => void): void;

    /** Fired when the cursor enters the marked range. From this event handler, the editor state may be inspected but not modified,
     with the exception that the range on which the event fires may be cleared. */
    function on(marker: TextMarker, eventName: 'beforeCursorEnter', handler: () => void): void;

    function off(marker: TextMarker, eventName: 'beforeCursorEnter', handler: () => void): void;

    /** Fired when the range is cleared, either through cursor movement in combination with clearOnEnter or through a call to its clear() method.
     Will only be fired once per handle. Note that deleting the range through text editing does not fire this event,
     because an undo action might bring the range back into existence. */
    function on(marker: TextMarker, eventName: 'clear', handler: () => void): void;

    function off(marker: TextMarker, eventName: 'clear', handler: () => void): void;

    /** Fired when the last part of the marker is removed from the document by editing operations. */
    function on(marker: TextMarker, eventName: 'hide', handler: () => void): void;

    function off(marker: TextMarker, eventName: 'hide', handler: () => void): void;

    /** Fired when, after the marker was removed by editing, a undo operation brought the marker back. */
    function on(marker: TextMarker, eventName: 'unhide', handler: () => void): void;

    function off(marker: TextMarker, eventName: 'unhide', handler: () => void): void;

    /** Fired whenever the editor re-adds the widget to the DOM. This will happen once right after the widget is added (if it is scrolled into view),
     and then again whenever it is scrolled out of view and back in again, or when changes to the editor options
     or the line the widget is on require the widget to be redrawn. */
    function on(line: LineWidget, eventName: 'redraw', handler: () => void): void;

    function off(line: LineWidget, eventName: 'redraw', handler: () => void): void;

    /** Various CodeMirror-related objects emit events, which allow client code to react to various situations.
     Handlers for such events can be registered with the on and off methods on the objects that the event fires on.
     To fire your own events, use CodeMirror.signal(target, name, args...), where target is a non-DOM-node object. */
    function signal(target: any, name: string, ...args: any[]): void;

    interface Editor {

        /** Expose the state object, so that the Editor.state.completionActive property is reachable*/
        state: any;

        /** Tells you whether the editor currently has focus. */
        hasFocus(): boolean;

        /** Used to find the target position for horizontal cursor motion.start is a { line , ch } object,
         amount an integer(may be negative), and unit one of the string "char", "column", or "word".
         Will return a position that is produced by moving amount times the distance specified by unit.
         When visually is true , motion in right - to - left text will be visual rather than logical.
         When the motion was clipped by hitting the end or start of the document, the returned value will have a hitSide property set to true. */
        findPosH(start: CodeMirror.Position, amount: number, unit: string, visually: boolean): { line: number; ch: number; hitSide?: boolean; };

        /** Similar to findPosH , but used for vertical motion.unit may be "line" or "page".
         The other arguments and the returned value have the same interpretation as they have in findPosH. */
        findPosV(start: CodeMirror.Position, amount: number, unit: string): { line: number; ch: number; hitSide?: boolean; };

        /** Change the configuration of the editor. option should the name of an option, and value should be a valid value for that option. */
        setOption(option: string, value: any): void;

        /** Retrieves the current value of the given option for this editor instance. */
        getOption(option: string): any;

        /** Attach an additional keymap to the editor.
         This is mostly useful for add - ons that need to register some key handlers without trampling on the extraKeys option.
         Maps added in this way have a higher precedence than the extraKeys and keyMap options, and between them,
         the maps added earlier have a lower precedence than those added later, unless the bottom argument was passed,
         in which case they end up below other keymaps added with this method. */
        addKeyMap(map: any, bottom?: boolean): void;

        /** Disable a keymap added with addKeyMap.Either pass in the keymap object itself , or a string,
         which will be compared against the name property of the active keymaps. */
        removeKeyMap(map: any): void;

        /** Enable a highlighting overlay.This is a stateless mini - mode that can be used to add extra highlighting.
         For example, the search add - on uses it to highlight the term that's currently being searched.
         mode can be a mode spec or a mode object (an object with a token method). The options parameter is optional. If given, it should be an object.
         Currently, only the opaque option is recognized. This defaults to off, but can be given to allow the overlay styling, when not null,
         to override the styling of the base mode entirely, instead of the two being applied together. */
        addOverlay(mode: any, options?: any): void;

        /** Pass this the exact argument passed for the mode parameter to addOverlay to remove an overlay again. */
        removeOverlay(mode: any): void;

        /** Retrieve the currently active document from an editor. */
        getDoc(): CodeMirror.Doc;

        /** Attach a new document to the editor. Returns the old document, which is now no longer associated with an editor. */
        swapDoc(doc: CodeMirror.Doc): CodeMirror.Doc;

        /** Get the content of the current editor document. You can pass it an optional argument to specify the string to be used to separate lines (defaults to "\n"). */
        getValue(seperator?: string): string;

        /** Set the content of the current editor document. */
        setValue(content: string): void;

        /** Sets the gutter marker for the given gutter (identified by its CSS class, see the gutters option) to the given value.
         Value can be either null, to clear the marker, or a DOM modal, to set it. The DOM modal will be shown in the specified gutter next to the specified line. */
        setGutterMarker(line: any, gutterID: string, value: HTMLElement): CodeMirror.LineHandle;

        /** Remove all gutter markers in the gutter with the given ID. */
        clearGutter(gutterID: string): void;

        /** Set a CSS class name for the given line.line can be a number or a line handle.
         where determines to which modal this class should be applied, can can be one of "text" (the text modal, which lies in front of the selection),
         "background"(a background modal that will be behind the selection),
         or "wrap" (the wrapper node that wraps all of the line's elements, including gutter elements).
         class should be the name of the class to apply. */
        addLineClass(line: any, where: string, _class_: string): CodeMirror.LineHandle;

        /** Remove a CSS class from a line.line can be a line handle or number.
         where should be one of "text", "background", or "wrap"(see addLineClass).
         class can be left off to remove all classes for the specified node, or be a string to remove only a specific class. */
        removeLineClass(line: any, where: string, class_: string): CodeMirror.LineHandle;

        /** Returns the line number, text content, and marker status of the given line, which can be either a number or a line handle. */
        lineInfo(line: any): {
            line: any;
            handle: any;
            text: string;
            /** Object mapping gutter IDs to marker elements. */
            gutterMarkers: any;
            textClass: string;
            bgClass: string;
            wrapClass: string;
            /** Array of line widgets attached to this line. */
            widgets: any;
        };

        /** Puts node, which should be an absolutely positioned DOM node, into the editor, positioned right below the given { line , ch } position.
         When scrollIntoView is true, the editor will ensure that the entire node is visible (if possible).
         To remove the widget again, simply use DOM methods (move it somewhere else, or call removeChild on its parent). */
        addWidget(pos: CodeMirror.Position, node: HTMLElement, scrollIntoView: boolean): void;

        /** Adds a line widget, an modal shown below a line, spanning the whole of the editor's width, and moving the lines below it downwards.
         line should be either an integer or a line handle, and node should be a DOM node, which will be displayed below the given line.
         options, when given, should be an object that configures the behavior of the widget.
         Note that the widget node will become a descendant of nodes with CodeMirror-specific CSS classes, and those classes might in some cases affect it. */
        addLineWidget(line: any, node: HTMLElement, options?: {
            /** Whether the widget should cover the gutter. */
            coverGutter: boolean;
            /** Whether the widget should stay fixed in the face of horizontal scrolling. */
            noHScroll: boolean;
            /** Causes the widget to be placed above instead of below the text of the line. */
            above: boolean;
            /** When true, will cause the widget to be rendered even if the line it is associated with is hidden. */
            showIfHidden: boolean;
        }): CodeMirror.LineWidget;

        /** Programatically set the size of the editor (overriding the applicable CSS rules).
         width and height height can be either numbers(interpreted as pixels) or CSS units ("100%", for example).
         You can pass null for either of them to indicate that that dimension should not be changed. */
        setSize(width: any, height: any): void;

        /** Scroll the editor to a given(pixel) position.Both arguments may be left as null or undefined to have no effect. */
        scrollTo(x: number, y: number): void;

        /** Get an { left , top , width , height , clientWidth , clientHeight } object that represents the current scroll position, the size of the scrollable area,
         and the size of the visible area(minus scrollbars). */
        getScrollInfo(): CodeMirror.ScrollInfo;

        /** Scrolls the given modal into view. pos is a { line , ch } position, referring to a given character, null, to refer to the cursor.
         The margin parameter is optional. When given, it indicates the amount of pixels around the given area that should be made visible as well. */
        scrollIntoView(pos: CodeMirror.Position, margin?: number): void;

        /** Scrolls the given modal into view. pos is a { left , top , right , bottom } object, in editor-local coordinates.
         The margin parameter is optional. When given, it indicates the amount of pixels around the given area that should be made visible as well. */
        scrollIntoView(pos: { left: number; top: number; right: number; bottom: number; }, margin: number): void;

        /** Scrolls the given modal into view. pos is a { line, ch } object, in editor-local coordinates.
         The margin parameter is optional. When given, it indicates the amount of pixels around the given area that should be made visible as well. */
        scrollIntoView(pos: { line: number, ch: number }, margin?: number): void;

        /** Scrolls the given modal into view. pos is a { from, to } object, in editor-local coordinates.
         The margin parameter is optional. When given, it indicates the amount of pixels around the given area that should be made visible as well. */
        scrollIntoView(pos: { from: CodeMirror.Position, to: CodeMirror.Position }, margin: number): void;

        /** Returns an { left , top , bottom } object containing the coordinates of the cursor position.
         If mode is "local" , they will be relative to the top-left corner of the editable document.
         If it is "page" or not given, they are relative to the top-left corner of the page.
         where is a boolean indicating whether you want the start(true) or the end(false) of the selection. */
        cursorCoords(where: boolean, mode: string): { left: number; top: number; bottom: number; };

        /** Returns an { left , top , bottom } object containing the coordinates of the cursor position.
         If mode is "local" , they will be relative to the top-left corner of the editable document.
         If it is "page" or not given, they are relative to the top-left corner of the page.
         where specifies the precise position at which you want to measure. */
        cursorCoords(where: CodeMirror.Position, mode: string): { left: number; top: number; bottom: number; };

        /** Returns the position and dimensions of an arbitrary character.pos should be a { line , ch } object.
         This differs from cursorCoords in that it'll give the size of the whole character,
         rather than just the position that the cursor would have when it would sit at that position. */
        charCoords(pos: CodeMirror.Position, mode: string): { left: number; right: number; top: number; bottom: number; };

        /** Given an { left , top } object , returns the { line , ch } position that corresponds to it.
         The optional mode parameter determines relative to what the coordinates are interpreted. It may be "window" , "page"(the default) , or "local". */
        coordsChar(object: { left: number; top: number; }, mode?: string): CodeMirror.Position;

        /** Returns the line height of the default font for the editor. */
        defaultTextHeight(): number;

        /** Returns the pixel width of an 'x' in the default font for the editor.
         (Note that for non - monospace fonts , this is mostly useless, and even for monospace fonts, non - ascii characters might have a different width). */
        defaultCharWidth(): number;

        /** Returns a { from , to } object indicating the start (inclusive) and end (exclusive) of the currently rendered part of the document.
         In big documents, when most content is scrolled out of view, CodeMirror will only render the visible part, and a margin around it.
         See also the viewportChange event. */
        getViewport(): { from: number; to: number };

        /** If your code does something to change the size of the editor modal (window resizes are already listened for), or unhides it,
         you should probably follow up by calling this method to ensure CodeMirror is still looking as intended. */
        refresh(): void;

        /** Retrieves information about the token the current mode found before the given position (a {line, ch} object). */
        getTokenAt(pos: CodeMirror.Position): {
            /** The character(on the given line) at which the token starts. */
            start: number;
            /** The character at which the token ends. */
            end: number;
            /** The token's string. */
            string: string;
            /** The token type the mode assigned to the token, such as "keyword" or "comment" (may also be null). */
            type: string;
            /** The mode's state at the end of this token. */
            state: any;
        };

        /** Returns the mode's parser state, if any, at the end of the given line number.
         If no line number is given, the state at the end of the document is returned.
         This can be useful for storing parsing errors in the state, or getting other kinds of contextual information for a line. */
        getStateAfter(line?: number): any;

        /** CodeMirror internally buffers changes and only updates its DOM structure after it has finished performing some operation.
         If you need to perform a lot of operations on a CodeMirror instance, you can call this method with a function argument.
         It will call the function, buffering up all changes, and only doing the expensive update after the function returns.
         This can be a lot faster. The return value from this method will be the return value of your function. */
        operation<T>(fn: () => T): T;

        /** Adjust the indentation of the given line.
         The second argument (which defaults to "smart") may be one of:
         "prev" Base indentation on the indentation of the previous line.
         "smart" Use the mode's smart indentation if available, behave like "prev" otherwise.
         "add" Increase the indentation of the line by one indent unit.
         "subtract" Reduce the indentation of the line. */
        indentLine(line: number, dir?: string): void;

        /** Give the editor focus. */
        focus(): void;

        /** Returns the hidden textarea used to read input. */
        getInputField(): HTMLTextAreaElement;

        /** Returns the DOM node that represents the editor, and controls its size. Remove this from your tree to delete an editor instance. */
        getWrapperElement(): HTMLElement;

        /** Returns the DOM node that is responsible for the scrolling of the editor. */
        getScrollerElement(): HTMLElement;

        /** Fetches the DOM node that contains the editor gutters. */
        getGutterElement(): HTMLElement;

        /** Events are registered with the on method (and removed with the off method).
         These are the events that fire on the instance object. The name of the event is followed by the arguments that will be passed to the handler.
         The instance argument always refers to the editor instance. */
        on(eventName: string, handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: string, handler: (instance: CodeMirror.Editor) => void): void;

        /** Fires every time the content of the editor is changed. */
        on(eventName: 'change', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList) => void): void;

        off(eventName: 'change', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList) => void): void;

        /** Like the "change" event, but batched per operation, passing an
         * array containing all the changes that happened in the operation.
         * This event is fired after the operation finished, and display
         * changes it makes will trigger a new operation. */
        on(eventName: 'changes', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList[]) => void): void;

        off(eventName: 'changes', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList[]) => void): void;

        /** This event is fired before a change is applied, and its handler may choose to modify or cancel the change.
         The changeObj never has a next property, since this is fired for each individual change, and not batched per operation.
         Note: you may not do anything from a "beforeChange" handler that would cause changes to the document or its visualization.
         Doing so will, since this handler is called directly from the bowels of the CodeMirror implementation,
         probably cause the editor to become corrupted. */
        on(eventName: 'beforeChange', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeCancellable) => void): void;

        off(eventName: 'beforeChange', handler: (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeCancellable) => void): void;

        /** Will be fired when the cursor or selection moves, or any change is made to the editor content. */
        on(eventName: 'cursorActivity', handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: 'cursorActivity', handler: (instance: CodeMirror.Editor) => void): void;

        /** This event is fired before the selection is moved. Its handler may modify the resulting selection head and anchor.
         Handlers for this event have the same restriction as "beforeChange" handlers � they should not do anything to directly update the state of the editor. */
        on(eventName: 'beforeSelectionChange', handler: (instance: CodeMirror.Editor, selection: { head: CodeMirror.Position; anchor: CodeMirror.Position; }) => void): void;

        off(eventName: 'beforeSelectionChange', handler: (instance: CodeMirror.Editor, selection: { head: CodeMirror.Position; anchor: CodeMirror.Position; }) => void): void;

        /** Fires whenever the view port of the editor changes (due to scrolling, editing, or any other factor).
         The from and to arguments give the new start and end of the viewport. */
        on(eventName: 'viewportChange', handler: (instance: CodeMirror.Editor, from: number, to: number) => void): void;

        off(eventName: 'viewportChange', handler: (instance: CodeMirror.Editor, from: number, to: number) => void): void;

        /** Fires when the editor gutter (the line-number area) is clicked. Will pass the editor instance as first argument,
         the (zero-based) number of the line that was clicked as second argument, the CSS class of the gutter that was clicked as third argument,
         and the raw mousedown event object as fourth argument. */
        on(eventName: 'gutterClick', handler: (instance: CodeMirror.Editor, line: number, gutter: string, clickEvent: Event) => void): void;

        off(eventName: 'gutterClick', handler: (instance: CodeMirror.Editor, line: number, gutter: string, clickEvent: Event) => void): void;

        /** Fires whenever the editor is focused. */
        on(eventName: 'focus', handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: 'focus', handler: (instance: CodeMirror.Editor) => void): void;

        /** Fires whenever the editor is unfocused. */
        on(eventName: 'blur', handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: 'blur', handler: (instance: CodeMirror.Editor) => void): void;

        /** Fires when the editor is scrolled. */
        on(eventName: 'scroll', handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: 'scroll', handler: (instance: CodeMirror.Editor) => void): void;

        /** Will be fired whenever CodeMirror updates its DOM display. */
        on(eventName: 'update', handler: (instance: CodeMirror.Editor) => void): void;

        off(eventName: 'update', handler: (instance: CodeMirror.Editor) => void): void;

        /** Fired whenever a line is (re-)rendered to the DOM. Fired right after the DOM modal is built, before it is added to the document.
         The handler may mess with the style of the resulting modal, or add event handlers, but should not try to change the state of the editor. */
        on(eventName: 'renderLine', handler: (instance: CodeMirror.Editor, line: number, element: HTMLElement) => void): void;

        off(eventName: 'renderLine', handler: (instance: CodeMirror.Editor, line: number, element: HTMLElement) => void): void;
    }

    interface EditorFromTextArea extends Editor {

        /** Copy the content of the editor into the textarea. */
        save(): void;

        /** Remove the editor, and restore the original textarea (with the editor's current content). */
        toTextArea(): void;

        /** Returns the textarea that the instance was based on. */
        getTextArea(): HTMLTextAreaElement;
    }

    interface DocConstructor {
        new (text: string, mode?: any, firstLineNumber?: number, lineSep?: string): Doc;

        (text: string, mode?: any, firstLineNumber?: number, lineSep?: string): Doc;
    }

    interface Doc {
        /** Expose the state object, so that the Doc.state.completionActive property is reachable*/
        state: any;

        /** Get the current editor content. You can pass it an optional argument to specify the string to be used to separate lines (defaults to "\n"). */
        getValue(seperator?: string): string;

        /** Set the editor content. */
        setValue(content: string): void;

        /** Get the text between the given points in the editor, which should be {line, ch} objects.
         An optional third argument can be given to indicate the line separator string to use (defaults to "\n"). */
        getRange(from: Position, to: CodeMirror.Position, seperator?: string): string;

        /** Replace the part of the document between from and to with the given string.
         from and to must be {line, ch} objects. to can be left off to simply insert the string at position from. */
        replaceRange(replacement: string, from: CodeMirror.Position, to?: CodeMirror.Position): void;

        /** Get the content of line n. */
        getLine(n: number): string;

        /** Set the content of line n. */
        setLine(n: number, text: string): void;

        /** Remove the given line from the document. */
        removeLine(n: number): void;

        /** Get the number of lines in the editor. */
        lineCount(): number;

        /** Get the first line of the editor. This will usually be zero but for linked sub-views,
         or documents instantiated with a non-zero first line, it might return other values. */
        firstLine(): number;

        /** Get the last line of the editor. This will usually be lineCount() - 1, but for linked sub-views, it might return other values. */
        lastLine(): number;

        /** Fetches the line handle for the given line number. */
        getLineHandle(num: number): CodeMirror.LineHandle;

        /** Given a line handle, returns the current position of that line (or null when it is no longer in the document). */
        getLineNumber(handle: CodeMirror.LineHandle): number;

        /** Iterate over the whole document, and call f for each line, passing the line handle.
         This is a faster way to visit a range of line handlers than calling getLineHandle for each of them.
         Note that line handles have a text property containing the line's content (as a string). */
        eachLine(f: (line: CodeMirror.LineHandle) => void): void;

        /** Iterate over the range from start up to (not including) end, and call f for each line, passing the line handle.
         This is a faster way to visit a range of line handlers than calling getLineHandle for each of them.
         Note that line handles have a text property containing the line's content (as a string). */
        eachLine(start: number, end: number, f: (line: CodeMirror.LineHandle) => void): void;

        /** Set the editor content as 'clean', a flag that it will retain until it is edited, and which will be set again when such an edit is undone again.
         Useful to track whether the content needs to be saved. */
        markClean(): void;

        /** Returns whether the document is currently clean (not modified since initialization or the last call to markClean). */
        isClean(): boolean;

        /** Get the currently selected code. */
        getSelection(): string;

        /** Replace the selection with the given string. By default, the new selection will span the inserted text.
         The optional collapse argument can be used to change this � passing "start" or "end" will collapse the selection to the start or end of the inserted text. */
        replaceSelection(replacement: string, collapse?: string): void;

        /** start is a an optional string indicating which end of the selection to return.
         It may be "start" , "end" , "head"(the side of the selection that moves when you press shift + arrow),
         or "anchor"(the fixed side of the selection).Omitting the argument is the same as passing "head".A { line , ch } object will be returned. */
        getCursor(start?: string): CodeMirror.Position;

        /** Retrieves a list of all current selections. These will always be sorted, and never overlap (overlapping selections are merged).
         Each object in the array contains anchor and head properties referring to {line, ch} objects. */
        listSelections(): { anchor: CodeMirror.Position; head: CodeMirror.Position }[];

        /** Return true if any text is selected. */
        somethingSelected(): boolean;

        /** Set the cursor position.You can either pass a single { line , ch } object , or the line and the character as two separate parameters. */
        setCursor(pos: CodeMirror.Position): void;

        /** Set the selection range.anchor and head should be { line , ch } objects.head defaults to anchor when not given. */
        setSelection(anchor: CodeMirror.Position, head: CodeMirror.Position): void;

        /** Similar to setSelection , but will, if shift is held or the extending flag is set,
         move the head of the selection while leaving the anchor at its current place.
         pos2 is optional , and can be passed to ensure a region (for example a word or paragraph) will end up selected
         (in addition to whatever lies between that region and the current anchor). */
        extendSelection(from: CodeMirror.Position, to?: CodeMirror.Position): void;

        /** Sets or clears the 'extending' flag , which acts similar to the shift key,
         in that it will cause cursor movement and calls to extendSelection to leave the selection anchor in place. */
        setExtending(value: boolean): void;

        /** Retrieve the editor associated with a document. May return null. */
        getEditor(): CodeMirror.Editor;

        /** Create an identical copy of the given doc. When copyHistory is true , the history will also be copied.Can not be called directly on an editor. */
        copy(copyHistory: boolean): CodeMirror.Doc;

        /** Create a new document that's linked to the target document. Linked documents will stay in sync (changes to one are also applied to the other) until unlinked. */
        linkedDoc(options: {
            /** When turned on, the linked copy will share an undo history with the original.
             Thus, something done in one of the two can be undone in the other, and vice versa. */
            sharedHist?: boolean;
            from?: number;
            /** Can be given to make the new document a subview of the original. Subviews only show a given range of lines.
             Note that line coordinates inside the subview will be consistent with those of the parent,
             so that for example a subview starting at line 10 will refer to its first line as line 10, not 0. */
            to?: number;
            /** By default, the new document inherits the mode of the parent. This option can be set to a mode spec to give it a different mode. */
            mode: any;
        }): CodeMirror.Doc;

        /** Break the link between two documents. After calling this , changes will no longer propagate between the documents,
         and, if they had a shared history, the history will become separate. */
        unlinkDoc(doc: CodeMirror.Doc): void;

        /** Will call the given function for all documents linked to the target document. It will be passed two arguments,
         the linked document and a boolean indicating whether that document shares history with the target. */
        iterLinkedDocs(fn: (doc: CodeMirror.Doc, sharedHist: boolean) => void): void;

        /** Undo one edit (if any undo events are stored). */
        undo(): void;

        /** Redo one undone edit. */
        redo(): void;

        /** Returns an object with {undo, redo } properties , both of which hold integers , indicating the amount of stored undo and redo operations. */
        historySize(): { undo: number; redo: number; };

        /** Clears the editor's undo history. */
        clearHistory(): void;

        /** Get a(JSON - serializeable) representation of the undo history. */
        getHistory(): any;

        /** Replace the editor's undo history with the one provided, which must be a value as returned by getHistory.
         Note that this will have entirely undefined results if the editor content isn't also the same as it was when getHistory was called. */
        setHistory(history: any): void;

        /** Can be used to mark a range of text with a specific CSS class name. from and to should be { line , ch } objects. */
        markText(from: CodeMirror.Position, to: CodeMirror.Position, options?: CodeMirror.TextMarkerOptions): TextMarker;

        /** Inserts a bookmark, a handle that follows the text around it as it is being edited, at the given position.
         A bookmark has two methods find() and clear(). The first returns the current position of the bookmark, if it is still in the document,
         and the second explicitly removes the bookmark. */
        setBookmark(pos: CodeMirror.Position, options?: {
            /** Can be used to display a DOM node at the current location of the bookmark (analogous to the replacedWith option to markText). */
            widget?: HTMLElement;

            /** By default, text typed when the cursor is on top of the bookmark will end up to the right of the bookmark.
             Set this option to true to make it go to the left instead. */
            insertLeft?: boolean;
        }): CodeMirror.TextMarker;

        /** Returns an array of all the bookmarks and marked ranges found between the given positions. */
        findMarks(from: CodeMirror.Position, to: CodeMirror.Position): TextMarker[];

        /** Returns an array of all the bookmarks and marked ranges present at the given position. */
        findMarksAt(pos: CodeMirror.Position): TextMarker[];

        /** Returns an array containing all marked ranges in the document. */
        getAllMarks(): CodeMirror.TextMarker[];

        /** Gets the mode object for the editor. Note that this is distinct from getOption("mode"), which gives you the mode specification,
         rather than the resolved, instantiated mode object. */
        getMode(): any;

        /** Calculates and returns a { line , ch } object for a zero-based index whose value is relative to the start of the editor's text.
         If the index is out of range of the text then the returned object is clipped to start or end of the text respectively. */
        posFromIndex(index: number): CodeMirror.Position;

        /** The reverse of posFromIndex. */
        indexFromPos(object: CodeMirror.Position): number;
    }

    interface LineHandle {
        text: string;
    }

    interface ScrollInfo {
        left: any;
        top: any;
        width: any;
        height: any;
        clientWidth: any;
        clientHeight: any;
    }

    interface TextMarker {
        /** Remove the mark. */
        clear(): void;

        /** Returns a {from, to} object (both holding document positions), indicating the current position of the marked range,
         or undefined if the marker is no longer in the document. */
        find(): CodeMirror.Range;

        /**  Returns an object representing the options for the marker. If copyWidget is given true, it will clone the value of the replacedWith option, if any. */
        getOptions(copyWidget: boolean): CodeMirror.TextMarkerOptions;
    }

    interface LineWidget {
        /** Removes the widget. */
        clear(): void;

        /** Call this if you made some change to the widget's DOM node that might affect its height.
         It'll force CodeMirror to update the height of the line that contains the widget. */
        changed(): void;
    }

    interface EditorChange {
        /** Position (in the pre-change coordinate system) where the change started. */
        from: CodeMirror.Position;
        /** Position (in the pre-change coordinate system) where the change ended. */
        to: CodeMirror.Position;
        /** Array of strings representing the text that replaced the changed range (split by line). */
        text: string[];
        /**  Text that used to be between from and to, which is overwritten by this change. */
        removed: string[];
        /**  String representing the origin of the change event and wether it can be merged with history */
        origin: string;
    }

    interface EditorChangeLinkedList extends CodeMirror.EditorChange {
        /** Points to another change object (which may point to another, etc). */
        next?: CodeMirror.EditorChangeLinkedList;
    }

    interface EditorChangeCancellable extends CodeMirror.EditorChange {
        /** may be used to modify the change. All three arguments to update are optional, and can be left off to leave the existing value for that field intact. */
        update(from?: CodeMirror.Position, to?: CodeMirror.Position, text?: string): void;

        cancel(): void;
    }

    interface PositionConstructor {
        new (line: number, ch?: number): Position;

        (line: number, ch?: number): Position;
    }

    interface Range {
        from: CodeMirror.Position;
        to: CodeMirror.Position;
    }

    interface Position {
        ch: number;
        line: number;
    }

    interface EditorConfiguration {
        /** string| The starting value of the editor. Can be a string, or a document object. */
        value?: any;

        /** string|object. The mode to use. When not given, this will default to the first mode that was loaded.
         It may be a string, which either simply names the mode or is a MIME type associated with the mode.
         Alternatively, it may be an object containing configuration options for the mode,
         with a name property that names the mode (for example {name: "javascript", json: true}). */
        mode?: any;

        /** The theme to style the editor with. You must make sure the CSS file defining the corresponding .cm-s-[name] styles is loaded.
         The default is "default". */
        theme?: string;

        /** How many spaces a block (whatever that means in the edited language) should be indented. The default is 2. */
        indentUnit?: number;

        /** Whether to use the context-sensitive indentation that the mode provides (or just indent the same as the line before). Defaults to true. */
        smartIndent?: boolean;

        /** The width of a tab character. Defaults to 4. */
        tabSize?: number;

        /** Whether, when indenting, the first N*tabSize spaces should be replaced by N tabs. Default is false. */
        indentWithTabs?: boolean;

        /** Configures whether the editor should re-indent the current line when a character is typed
         that might change its proper indentation (only works if the mode supports indentation). Default is true. */
        electricChars?: boolean;

        /** Determines whether horizontal cursor movement through right-to-left (Arabic, Hebrew) text
         is visual (pressing the left arrow moves the cursor left)
         or logical (pressing the left arrow moves to the next lower index in the string, which is visually right in right-to-left text).
         The default is false on Windows, and true on other platforms. */
        rtlMoveVisually?: boolean;

        /** Configures the keymap to use. The default is "default", which is the only keymap defined in codemirror.js itself.
         Extra keymaps are found in the keymap directory. See the section on keymaps for more information. */
        keyMap?: string;

        /** Can be used to specify extra keybindings for the editor, alongside the ones defined by keyMap. Should be either null, or a valid keymap value. */
        extraKeys?: any;

        /** Whether CodeMirror should scroll or wrap for long lines. Defaults to false (scroll). */
        lineWrapping?: boolean;

        /** Whether to show line numbers to the left of the editor. */
        lineNumbers?: boolean;

        /** At which number to start counting lines. Default is 1. */
        firstLineNumber?: number;

        /** A function used to format line numbers. The function is passed the line number, and should return a string that will be shown in the gutter. */
        lineNumberFormatter?: (line: number) => string;

        /** Can be used to add extra gutters (beyond or instead of the line number gutter).
         Should be an array of CSS class names, each of which defines a width (and optionally a background),
         and which will be used to draw the background of the gutters.
         May include the CodeMirror-linenumbers class, in order to explicitly set the position of the line number gutter
         (it will default to be to the right of all other gutters). These class names are the keys passed to setGutterMarker. */
        gutters?: string[];

        /** Determines whether the gutter scrolls along with the content horizontally (false)
         or whether it stays fixed during horizontal scrolling (true, the default). */
        fixedGutter?: boolean;

        /** boolean|string. This disables editing of the editor content by the user. If the special value "nocursor" is given (instead of simply true), focusing of the editor is also disallowed. */
        readOnly?: any;

        /**Whether the cursor should be drawn when a selection is active. Defaults to false. */
        showCursorWhenSelecting?: boolean;

        /** The maximum number of undo levels that the editor stores. Defaults to 40. */
        undoDepth?: number;

        /** The period of inactivity (in milliseconds) that will cause a new history event to be started when typing or deleting. Defaults to 500. */
        historyEventDelay?: number;

        /** The tab index to assign to the editor. If not given, no tab index will be assigned. */
        tabindex?: number;

        /** Can be used to make CodeMirror focus itself on initialization. Defaults to off.
         When fromTextArea is used, and no explicit value is given for this option, it will be set to true when either the source textarea is focused,
         or it has an autofocus attribute and no other element is focused. */
        autofocus?: boolean;

        /** Controls whether drag-and - drop is enabled. On by default. */
        dragDrop?: boolean;

        /** When given , this will be called when the editor is handling a dragenter , dragover , or drop event.
         It will be passed the editor instance and the event object as arguments.
         The callback can choose to handle the event itself , in which case it should return true to indicate that CodeMirror should not do anything further. */
        onDragEvent?: (instance: CodeMirror.Editor, event: Event) => boolean;

        /** This provides a rather low - level hook into CodeMirror's key handling.
         If provided, this function will be called on every keydown, keyup, and keypress event that CodeMirror captures.
         It will be passed two arguments, the editor instance and the key event.
         This key event is pretty much the raw key event, except that a stop() method is always added to it.
         You could feed it to, for example, jQuery.Event to further normalize it.
         This function can inspect the key event, and handle it if it wants to.
         It may return true to tell CodeMirror to ignore the event.
         Be wary that, on some browsers, stopping a keydown does not stop the keypress from firing, whereas on others it does.
         If you respond to an event, you should probably inspect its type property and only do something when it is keydown
         (or keypress for actions that need character data). */
        onKeyEvent?: (instance: CodeMirror.Editor, event: Event) => boolean;

        /** Half - period in milliseconds used for cursor blinking. The default blink rate is 530ms. */
        cursorBlinkRate?: number;

        /** Determines the height of the cursor. Default is 1 , meaning it spans the whole height of the line.
         For some fonts (and by some tastes) a smaller height (for example 0.85),
         which causes the cursor to not reach all the way to the bottom of the line, looks better */
        cursorHeight?: number;

        /** Highlighting is done by a pseudo background - thread that will work for workTime milliseconds,
         and then use timeout to sleep for workDelay milliseconds.
         The defaults are 200 and 300, you can change these options to make the highlighting more or less aggressive. */
        workTime?: number;

        /** See workTime. */
        workDelay?: number;

        /** Indicates how quickly CodeMirror should poll its input textarea for changes(when focused).
         Most input is captured by events, but some things, like IME input on some browsers, don't generate events that allow CodeMirror to properly detect it.
         Thus, it polls. Default is 100 milliseconds. */
        pollInterval?: number

        /** By default, CodeMirror will combine adjacent tokens into a single span if they have the same class.
         This will result in a simpler DOM tree, and thus perform better. With some kinds of styling(such as rounded corners),
         this will change the way the document looks. You can set this option to false to disable this behavior. */
        flattenSpans?: boolean;

        /** When highlighting long lines, in order to stay responsive, the editor will give up and simply style
         the rest of the line as plain text when it reaches a certain position. The default is 10000.
         You can set this to Infinity to turn off this behavior. */
        maxHighlightLength?: number;

        /** Specifies the amount of lines that are rendered above and below the part of the document that's currently scrolled into view.
         This affects the amount of updates needed when scrolling, and the amount of work that such an update does.
         You should usually leave it at its default, 10. Can be set to Infinity to make sure the whole document is always rendered,
         and thus the browser's text search works on it. This will have bad effects on performance of big documents. */
        viewportMargin?: number;

        /** Optional lint configuration to be used in conjunction with CodeMirror's linter addon. */
        lint?: boolean | LintOptions;

        /** Optional value to be used in conjunction with CodeMirror’s placeholder add-on. */
        placeholder?: string;
    }

    interface TextMarkerOptions {
        /** Assigns a CSS class to the marked stretch of text. */
        className?: string;

        /** Determines whether text inserted on the left of the marker will end up inside or outside of it. */
        inclusiveLeft?: boolean;

        /** Like inclusiveLeft , but for the right side. */
        inclusiveRight?: boolean;

        /** Atomic ranges act as a single unit when cursor movement is concerned — i.e. it is impossible to place the cursor inside of them.
         In atomic ranges, inclusiveLeft and inclusiveRight have a different meaning — they will prevent the cursor from being placed
         respectively directly before and directly after the range. */
        atomic?: boolean;

        /** Collapsed ranges do not show up in the display.Setting a range to be collapsed will automatically make it atomic. */
        collapsed?: boolean;

        /** When enabled, will cause the mark to clear itself whenever the cursor enters its range.
         This is mostly useful for text - replacement widgets that need to 'snap open' when the user tries to edit them.
         The "clear" event fired on the range handle can be used to be notified when this happens. */
        clearOnEnter?: boolean;

        /** Determines whether the mark is automatically cleared when it becomes empty. Default is true. */
        clearWhenEmpty?: boolean;

        /** Use a given node to display this range.Implies both collapsed and atomic.
         The given DOM node must be an inline element(as opposed to a block element). */
        replacedWith?: HTMLElement;

        /** When replacedWith is given, this determines whether the editor will
         * capture mouse and drag events occurring in this widget. Default is
         * false—the events will be left alone for the default browser handler,
         * or specific handlers on the widget, to capture. */
        handleMouseEvents?: boolean;

        /** A read - only span can, as long as it is not cleared, not be modified except by calling setValue to reset the whole document.
         Note: adding a read - only span currently clears the undo history of the editor,
         because existing undo events being partially nullified by read - only spans would corrupt the history (in the current implementation). */
        readOnly?: boolean;

        /** When set to true (default is false), adding this marker will create an event in the undo history that can be individually undone(clearing the marker). */
        addToHistory?: boolean;

        /** Can be used to specify an extra CSS class to be applied to the leftmost span that is part of the marker. */
        startStyle?: string;

        /** Equivalent to startStyle, but for the rightmost span. */
        endStyle?: string;

        /** A string of CSS to be applied to the covered text. For example "color: #fe3". */
        css?: string;

        /** When given, will give the nodes created for this span a HTML title attribute with the given value. */
        title?: string;

        /** When the target document is linked to other documents, you can set shared to true to make the marker appear in all documents.
         By default, a marker appears only in its target document. */
        shared?: boolean;
    }

    interface StringStream {
        lastColumnPos: number;
        lastColumnValue: number;
        lineStart: number;

        /**
         * Current position in the string.
         */
        pos: number;

        /**
         * Where the stream's position was when it was first passed to the token function.
         */
        start: number;

        /**
         * The current line's content.
         */
        string: string;

        /**
         * Number of spaces per tab character.
         */
        tabSize: number;

        /**
         * Returns true only if the stream is at the end of the line.
         */
        eol(): boolean;

        /**
         * Returns true only if the stream is at the start of the line.
         */
        sol(): boolean;

        /**
         * Returns the next character in the stream without advancing it. Will return an null at the end of the line.
         */
        peek(): string;

        /**
         * Returns the next character in the stream and advances it. Also returns null when no more characters are available.
         */
        next(): string;

        /**
         * match can be a character, a regular expression, or a function that takes a character and returns a boolean.
         * If the next character in the stream 'matches' the given argument, it is consumed and returned.
         * Otherwise, undefined is returned.
         */
        eat(match: string): string;

        eat(match: RegExp): string;

        eat(match: (char: string) => boolean): string;

        /**
         * Repeatedly calls eat with the given argument, until it fails. Returns true if any characters were eaten.
         */
        eatWhile(match: string): boolean;

        eatWhile(match: RegExp): boolean;

        eatWhile(match: (char: string) => boolean): boolean;

        /**
         * Shortcut for eatWhile when matching white-space.
         */
        eatSpace(): boolean;

        /**
         * Moves the position to the end of the line.
         */
        skipToEnd(): void;

        /**
         * Skips to the next occurrence of the given character, if found on the current line (doesn't advance the stream if
         * the character does not occur on the line).
         *
         * Returns true if the character was found.
         */
        skipTo(ch: string): boolean;

        /**
         * Act like a multi-character eat - if consume is true or not given - or a look-ahead that doesn't update the stream
         * position - if it is false. pattern can be either a string or a regular expression starting with ^. When it is a
         * string, caseFold can be set to true to make the match case-insensitive. When successfully matching a regular
         * expression, the returned value will be the array returned by match, in case you need to extract matched groups.
         */
        match(pattern: string, consume?: boolean, caseFold?: boolean): boolean;

        match(pattern: RegExp, consume?: boolean): string[];

        /**
         * Backs up the stream n characters. Backing it up further than the start of the current token will cause things to
         * break, so be careful.
         */
        backUp(n: number): void;

        /**
         * Returns the column (taking into account tabs) at which the current token starts.
         */
        column(): number;

        /**
         * Tells you how far the current line has been indented, in spaces. Corrects for tab characters.
         */
        indentation(): number;

        /**
         * Get the string between the start of the current token and the current stream position.
         */
        current(): string;
    }

    /**
     * A Mode is, in the simplest case, a lexer (tokenizer) for your language — a function that takes a character stream as input,
     * advances it past a token, and returns a style for that token. More advanced modes can also handle indentation for the language.
     */
    interface Mode<T> {
        /**
         * A function that produces a state object to be used at the start of a document.
         */
        startState?: () => T;
        /**
         * For languages that have significant blank lines, you can define a blankLine(state) method on your mode that will get called
         * whenever a blank line is passed over, so that it can update the parser state.
         */
        blankLine?: (state: T) => void;
        /**
         * Given a state returns a safe copy of that state.
         */
        copyState?: (state: T) => T;
        /**
         * The indentation method should inspect the given state object, and optionally the textAfter string, which contains the text on
         * the line that is being indented, and return an integer, the amount of spaces to indent.
         */
        indent?: (state: T, textAfter: string) => number;
        /** The four below strings are used for working with the commenting addon. */
        /**
         * String that starts a line comment.
         */
        lineComment?: string;
        /**
         * String that starts a block comment.
         */
        blockCommentStart?: string;
        /**
         * String that ends a block comment.
         */
        blockCommentEnd?: string;
        /**
         * String to put at the start of continued lines in a block comment.
         */
        blockCommentLead?: string;
        /**
         * Trigger a reindent whenever one of the characters in the string is typed.
         */
        electricChars?: string
        /**
         * Trigger a reindent whenever the regex matches the part of the line before the cursor.
         */
        electricinput?: RegExp

        /**
         * This function should read one token from the stream it is given as an argument, optionally update its state,
         * and return a style string, or null for tokens that do not have to be styled. Multiple styles can be returned, separated by spaces.
         */
        token(stream: StringStream, state: T): string;
    }

    /**
     * A function that, given a CodeMirror configuration object and an optional mode configuration object, returns a mode object.
     */
    interface ModeFactory<T> {
        (config: CodeMirror.EditorConfiguration, modeOptions?: any): Mode<T>
    }

    /**
     * id will be the id for the defined mode. Typically, you should use this second argument to defineMode as your module scope function
     * (modes should not leak anything into the global scope!), i.e. write your whole mode inside this function.
     */
    function defineMode(id: string, modefactory: ModeFactory<any>): void;

    /**
     * id will be the id for the defined mode. Typically, you should use this second argument to defineMode as your module scope function
     * (modes should not leak anything into the global scope!), i.e. write your whole mode inside this function.
     */
    function defineMode<T>(id: string, modefactory: ModeFactory<T>): void;

    /**
     * The first argument is a configuration object as passed to the mode constructor function, and the second argument
     * is a mode specification as in the EditorConfiguration mode option.
     */
    function getMode<T>(config: CodeMirror.EditorConfiguration, mode: any): Mode<T>;

    /**
     * Utility function from the overlay.js addon that allows modes to be combined. The mode given as the base argument takes care of
     * most of the normal mode functionality, but a second (typically simple) mode is used, which can override the style of text.
     * Both modes get to parse all of the text, but when both assign a non-null style to a piece of code, the overlay wins, unless
     * the combine argument was true and not overridden, or state.overlay.combineTokens was true, in which case the styles are combined.
     */
    function overlayMode<T, S>(base: Mode<T>, overlay: Mode<S>, combine?: boolean): Mode<any>

    /**
     * async specifies that the lint process runs asynchronously. hasGutters specifies that lint errors should be displayed in the CodeMirror
     * gutter, note that you must use this in conjunction with [ "CodeMirror-lint-markers" ] as an modal in the gutters argument on
     * initialization of the CodeMirror instance.
     */
    interface LintStateOptions {
        async: boolean;
        hasGutters: boolean;
    }

    /**
     * Adds the getAnnotations callback to LintStateOptions which may be overridden by the user if they choose use their own
     * linter.
     */
    interface LintOptions extends LintStateOptions {
        getAnnotations: AnnotationsCallback;
    }

    /**
     * A function that calls the updateLintingCallback with any errors found during the linting process.
     */
    interface AnnotationsCallback {
        (content: string, updateLintingCallback: UpdateLintingCallback, options: LintStateOptions, codeMirror: Editor): void;
    }

    /**
     * A function that, given an array of annotations, updates the CodeMirror linting GUI with those annotations
     */
    interface UpdateLintingCallback {
        (codeMirror: Editor, annotations: Annotation[]): void;
    }

    /**
     * An annotation contains a description of a lint error, detailing the location of the error within the code, the severity of the error,
     * and an explaination as to why the error was thrown.
     */
    interface Annotation {
        from: Position;
        message?: string;
        severity?: string;
        to?: Position;
    }

    /**
     * A function that calculates either a two-way or three-way merge between different sets of content.
     */
    function MergeView(element: HTMLElement, options?: MergeView.MergeViewEditorConfiguration): MergeView.MergeViewEditor;

    namespace MergeView {
        /**
         * Options available to MergeView.
         */
        interface MergeViewEditorConfiguration extends EditorConfiguration {
            /**
             * Determines whether the original editor allows editing. Defaults to false.
             */
            allowEditingOriginals?: boolean;

            /**
             * When true stretches of unchanged text will be collapsed. When a number is given, this indicates the amount
             * of lines to leave visible around such stretches (which defaults to 2). Defaults to false.
             */
            collapseIdentical?: boolean | number;

            /**
             * Sets the style used to connect changed chunks of code. By default, connectors are drawn. When this is set to "align",
             * the smaller chunk is padded to align with the bigger chunk instead.
             */
            connect?: string;
            /**
             * Provides original version of the document to be shown on the right of the editor.
             */
            orig: any;
            /**
             * Provides original version of the document to be shown on the left of the editor.
             * To create a 2-way (as opposed to 3-way) merge view, provide only one of origLeft and origRight.
             */
            origLeft?: any;
            /**
             * Provides original version of document to be shown on the right of the editor.
             * To create a 2-way (as opposed to 3-way) merge view, provide only one of origLeft and origRight.
             */
            origRight?: any;
            /**
             * Determines whether buttons that allow the user to revert changes are shown. Defaults to true.
             */
            revertButtons?: boolean;
            /**
             * When true, changed pieces of text are highlighted. Defaults to true.
             */
            showDifferences?: boolean;

            /**
             * Callback for when stretches of unchanged text are collapsed.
             */
            onCollapse?(mergeView: MergeViewEditor, line: number, size: number, mark: TextMarker): void;
        }

        interface MergeViewEditor extends Editor {
            /**
             * Left side of the merge view.
             */
            left: DiffView;
            /**
             * Right side of the merge view.
             */
            right: DiffView;

            /**
             * Returns the editor instance.
             */
            editor(): Editor;

            leftChunks(): MergeViewDiffChunk;

            leftOriginal(): Editor;

            rightChunks(): MergeViewDiffChunk;

            rightOriginal(): Editor;

            /**
             * Sets whether or not the merge view should show the differences between the editor views.
             */
            setShowDifferences(showDifferences: boolean): void;
        }

        /**
         * Tracks changes in chunks from oroginal to new.
         */
        interface MergeViewDiffChunk {
            editFrom: number;
            editTo: number;
            origFrom: number;
            origTo: number;
        }

        interface DiffView {
            /**
             * Forces the view to reload.
             */
            forceUpdate(): (mode: string) => void;

            /**
             * Sets whether or not the merge view should show the differences between the editor views.
             */
            setShowDifferences(showDifferences: boolean): void;
        }
    }
}

declare module "codemirror" {
    export = CodeMirror;
}

//
// Copyright (c) 2017 Max Shaydo aka MaxGraey (https://github.com/MaxGraey)
//

declare type GLint64 = number;
declare type GLuint64EXT = GLint64;

interface WebGLQuery extends WebGLObject {
}

declare var WebGLQuery: {
    prototype: WebGLQuery;
    new(): WebGLQuery;
};

interface WebGLSampler extends WebGLObject {
}

declare var WebGLSampler: {
    prototype: WebGLSampler;
    new(): WebGLSampler;
};

interface WebGLSync extends WebGLObject {
}

declare var WebGLSync: {
    prototype: WebGLSync;
    new(): WebGLSync;
};

interface WebGLTransformFeedback extends WebGLObject {
}

declare var WebGLTransformFeedback: {
    prototype: WebGLTransformFeedback;
    new(): WebGLTransformFeedback;
};

interface WebGLVertexArrayObject extends WebGLObject {
}

declare var WebGLVertexArrayObject: {
    prototype: WebGLVertexArrayObject;
    new(): WebGLVertexArrayObject;
};

interface WebGLTimerQueryEXT extends WebGLQuery {
}

declare var WebGLTimerQueryEXT: {
    prototype: WebGLTimerQueryEXT;
    new(): WebGLTimerQueryEXT;
};


interface EXT_disjoint_timer_query {
    readonly QUERY_COUNTER_BITS_EXT: number;
    readonly CURRENT_QUERY_EXT: number;
    readonly QUERY_RESULT_EXT: number;
    readonly QUERY_RESULT_AVAILABLE_EXT: number;
    readonly TIME_ELAPSED_EXT: number;
    readonly TIMESTAMP_EXT: number;
    readonly GPU_DISJOINT_EXT: number;

    createQueryEXT(): WebGLTimerQueryEXT | null;

    deleteQueryEXT(query: WebGLTimerQueryEXT | null): void;

    isQueryEXT(query: WebGLTimerQueryEXT | null): boolean;

    beginQueryEXT(target: number, query: WebGLTimerQueryEXT | null): void;

    endQueryEXT(target: number): void;

    queryCounterEXT(query: WebGLTimerQueryEXT | null, target: number): number;

    getQueryEXT(target: number, pname: number): WebGLTimerQueryEXT | number | null;

    getQueryObjectEXT(query: WebGLTimerQueryEXT | null, pname: number): number | boolean;
}

declare var EXT_disjoint_timer_query: {
    prototype: EXT_disjoint_timer_query;
    new(): EXT_disjoint_timer_query;

    readonly QUERY_COUNTER_BITS_EXT: number;
    readonly CURRENT_QUERY_EXT: number;
    readonly QUERY_RESULT_EXT: number;
    readonly QUERY_RESULT_AVAILABLE_EXT: number;
    readonly TIME_ELAPSED_EXT: number;
    readonly TIMESTAMP_EXT: number;
    readonly GPU_DISJOINT_EXT: number;
};


interface WebGL2RenderingContext extends WebGLRenderingContext {
    // Getting GL parameter information
    readonly READ_BUFFER: number;
    readonly UNPACK_ROW_LENGTH: number;
    readonly UNPACK_SKIP_ROWS: number;
    readonly UNPACK_SKIP_PIXELS: number;
    readonly PACK_ROW_LENGTH: number;
    readonly PACK_SKIP_ROWS: number;
    readonly PACK_SKIP_PIXELS: number;
    readonly TEXTURE_BINDING_3D: number;
    readonly UNPACK_SKIP_IMAGES: number;
    readonly UNPACK_IMAGE_HEIGHT: number;
    readonly MAX_3D_TEXTURE_SIZE: number;
    readonly MAX_ELEMENTS_VERTICES: number;
    readonly MAX_ELEMENTS_INDICES: number;
    readonly MAX_TEXTURE_LOD_BIAS: number;
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: number;

    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, offset: number): void;
    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, source: ImageData | ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    readonly MAX_ARRAY_TEXTURE_LAYERS: number;
    readonly MIN_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_VARYING_COMPONENTS: number;
    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, offset: number): void;
    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, source: ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
    readonly RASTERIZER_DISCARD: number;
    readonly VERTEX_ARRAY_BINDING: number;
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: number;
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: number;
    readonly MAX_SERVER_WAIT_TIMEOUT: number;
    readonly MAX_ELEMENT_INDEX: number;
    // Textures
    readonly RED: number;
    readonly RGB8: number;
    readonly RGBA8: number;
    readonly RGB10_A2: number;
    readonly TEXTURE_3D: number;
    readonly TEXTURE_WRAP_R: number;
    readonly TEXTURE_MIN_LOD: number;
    readonly TEXTURE_MAX_LOD: number;
    readonly TEXTURE_BASE_LEVEL: number;
    readonly TEXTURE_MAX_LEVEL: number;
    readonly TEXTURE_COMPARE_MODE: number;
    readonly TEXTURE_COMPARE_FUNC: number;
    readonly SRGB: number;
    readonly SRGB8: number;
    readonly SRGB8_ALPHA8: number;
    readonly COMPARE_REF_TO_TEXTURE: number;
    readonly RGBA32F: number;
    readonly RGB32F: number;
    readonly RGBA16F: number;
    readonly RGB16F: number;
    readonly TEXTURE_2D_ARRAY: number;
    readonly TEXTURE_BINDING_2D_ARRAY: number;
    readonly R11F_G11F_B10F: number;
    readonly RGB9_E5: number;
    readonly RGBA32UI: number;
    readonly RGB32UI: number;
    readonly RGBA16UI: number;
    readonly RGB16UI: number;
    readonly RGBA8UI: number;
    readonly RGB8UI: number;
    readonly RGBA32I: number;
    readonly RGB32I: number;
    readonly RGBA16I: number;
    readonly RGB16I: number;
    readonly RGBA8I: number;
    readonly RGB8I: number;
    readonly RED_INTEGER: number;
    readonly RGB_INTEGER: number;
    readonly RGBA_INTEGER: number;
    readonly R8: number;
    readonly RG8: number;
    readonly R16F: number;
    readonly R32F: number;
    readonly RG16F: number;
    readonly RG32F: number;
    readonly R8I: number;
    readonly R8UI: number;
    readonly R16I: number;
    readonly R16UI: number;
    readonly R32I: number;
    readonly R32UI: number;
    readonly RG8I: number;
    readonly RG8UI: number;
    readonly RG16I: number;
    readonly RG16UI: number;
    readonly RG32I: number;
    readonly RG32UI: number;
    readonly R8_SNORM: number;
    readonly RG8_SNORM: number;
    readonly RGB8_SNORM: number;
    readonly RGBA8_SNORM: number;
    readonly RGB10_A2UI: number;
    readonly TEXTURE_IMMUTABLE_FORMAT: number;
    readonly TEXTURE_IMMUTABLE_LEVELS: number;
    // Compressed textures
    readonly COMPRESSED_R11_EAC: number;
    readonly COMPRESSED_SIGNED_R11_EAC: number;
    readonly COMPRESSED_RG11_EAC: number;
    readonly COMPRESSED_SIGNED_RG11_EAC: number;
    readonly COMPRESSED_RGB8_ETC2: number;
    readonly COMPRESSED_SRGB8_ETC2: number;
    readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: number;
    // Pixel types
    readonly UNSIGNED_INT_2_10_10_10_REV: number;
    readonly UNSIGNED_INT_10F_11F_11F_REV: number;
    readonly UNSIGNED_INT_5_9_9_9_REV: number;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
    readonly UNSIGNED_INT_24_8: number;
    readonly HALF_FLOAT: number;
    readonly RG: number;
    readonly RG_INTEGER: number;
    readonly INT_2_10_10_10_REV: number;
    // Queries
    readonly CURRENT_QUERY: number;
    readonly QUERY_RESULT: number;
    readonly QUERY_RESULT_AVAILABLE: number;
    readonly ANY_SAMPLES_PASSED: number;
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: number;
    // Draw buffers
    readonly MAX_DRAW_BUFFERS: number;
    readonly DRAW_BUFFER0: number;
    readonly DRAW_BUFFER1: number;
    readonly DRAW_BUFFER2: number;
    readonly DRAW_BUFFER3: number;
    readonly DRAW_BUFFER4: number;
    readonly DRAW_BUFFER5: number;
    readonly DRAW_BUFFER6: number;
    readonly DRAW_BUFFER7: number;
    readonly DRAW_BUFFER8: number;
    readonly DRAW_BUFFER9: number;
    readonly DRAW_BUFFER10: number;
    readonly DRAW_BUFFER11: number;
    readonly DRAW_BUFFER12: number;
    readonly DRAW_BUFFER13: number;
    readonly DRAW_BUFFER14: number;
    readonly DRAW_BUFFER15: number;
    readonly MAX_COLOR_ATTACHMENTS: number;
    readonly COLOR_ATTACHMENT1: number;
    readonly COLOR_ATTACHMENT2: number;
    readonly COLOR_ATTACHMENT3: number;
    readonly COLOR_ATTACHMENT4: number;
    readonly COLOR_ATTACHMENT5: number;
    readonly COLOR_ATTACHMENT6: number;
    readonly COLOR_ATTACHMENT7: number;
    readonly COLOR_ATTACHMENT8: number;
    readonly COLOR_ATTACHMENT9: number;
    readonly COLOR_ATTACHMENT10: number;
    readonly COLOR_ATTACHMENT11: number;
    readonly COLOR_ATTACHMENT12: number;
    readonly COLOR_ATTACHMENT13: number;
    readonly COLOR_ATTACHMENT14: number;
    readonly COLOR_ATTACHMENT15: number;
    // Samplers
    readonly SAMPLER_3D: number;
    readonly SAMPLER_2D_SHADOW: number;
    readonly SAMPLER_2D_ARRAY: number;
    readonly SAMPLER_2D_ARRAY_SHADOW: number;
    readonly SAMPLER_CUBE_SHADOW: number;
    readonly INT_SAMPLER_2D: number;
    readonly INT_SAMPLER_3D: number;
    readonly INT_SAMPLER_CUBE: number;
    readonly INT_SAMPLER_2D_ARRAY: number;
    readonly UNSIGNED_INT_SAMPLER_2D: number;
    readonly UNSIGNED_INT_SAMPLER_3D: number;
    readonly UNSIGNED_INT_SAMPLER_CUBE: number;
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: number;
    readonly MAX_SAMPLES: number;
    readonly SAMPLER_BINDING: number;
    // Buffers
    readonly PIXEL_PACK_BUFFER: number;
    readonly PIXEL_UNPACK_BUFFER: number;
    readonly PIXEL_PACK_BUFFER_BINDING: number;
    readonly PIXEL_UNPACK_BUFFER_BINDING: number;
    readonly COPY_READ_BUFFER: number;
    readonly COPY_WRITE_BUFFER: number;
    readonly COPY_READ_BUFFER_BINDING: number;
    readonly COPY_WRITE_BUFFER_BINDING: number;
    // Data types
    readonly FLOAT_MAT2x3: number;
    readonly FLOAT_MAT2x4: number;
    readonly FLOAT_MAT3x2: number;
    readonly FLOAT_MAT3x4: number;
    readonly FLOAT_MAT4x2: number;
    readonly FLOAT_MAT4x3: number;
    readonly UNSIGNED_INT_VEC2: number;
    readonly UNSIGNED_INT_VEC3: number;
    readonly UNSIGNED_INT_VEC4: number;
    readonly UNSIGNED_NORMALIZED: number;
    readonly SIGNED_NORMALIZED: number;
    // Vertex attributes
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: number;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;
    // Transform feedback
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: number;
    readonly TRANSFORM_FEEDBACK_VARYINGS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_START: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: number;
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: number;
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: number;
    readonly INTERLEAVED_ATTRIBS: number;
    readonly SEPARATE_ATTRIBS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: number;
    readonly TRANSFORM_FEEDBACK: number;
    readonly TRANSFORM_FEEDBACK_PAUSED: number;
    readonly TRANSFORM_FEEDBACK_ACTIVE: number;
    readonly TRANSFORM_FEEDBACK_BINDING: number;
    // Framebuffers and renderbuffers
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: number;
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: number;
    readonly FRAMEBUFFER_DEFAULT: number;
    readonly DEPTH_STENCIL_ATTACHMENT: number;
    readonly DEPTH_STENCIL: number;
    readonly DEPTH24_STENCIL8: number;
    readonly DRAW_FRAMEBUFFER_BINDING: number;
    readonly READ_FRAMEBUFFER: number;
    readonly DRAW_FRAMEBUFFER: number;
    readonly READ_FRAMEBUFFER_BINDING: number;
    readonly RENDERBUFFER_SAMPLES: number;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: number;
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: number;
    // Uniforms
    readonly UNIFORM_BUFFER: number;
    readonly UNIFORM_BUFFER_BINDING: number;
    readonly UNIFORM_BUFFER_START: number;
    readonly UNIFORM_BUFFER_SIZE: number;
    readonly MAX_VERTEX_UNIFORM_BLOCKS: number;
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: number;
    readonly MAX_COMBINED_UNIFORM_BLOCKS: number;
    readonly MAX_UNIFORM_BUFFER_BINDINGS: number;
    readonly MAX_UNIFORM_BLOCK_SIZE: number;
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: number;
    readonly ACTIVE_UNIFORM_BLOCKS: number;
    readonly UNIFORM_TYPE: number;
    readonly UNIFORM_SIZE: number;
    readonly UNIFORM_BLOCK_INDEX: number;
    readonly UNIFORM_OFFSET: number;
    readonly UNIFORM_ARRAY_STRIDE: number;
    readonly UNIFORM_MATRIX_STRIDE: number;
    readonly UNIFORM_IS_ROW_MAJOR: number;
    readonly UNIFORM_BLOCK_BINDING: number;
    readonly UNIFORM_BLOCK_DATA_SIZE: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: number;
    // Sync objects
    readonly OBJECT_TYPE: number;
    readonly SYNC_CONDITION: number;
    readonly SYNC_STATUS: number;
    readonly SYNC_FLAGS: number;
    readonly SYNC_FENCE: number;
    readonly SYNC_GPU_COMMANDS_COMPLETE: number;
    readonly UNSIGNALED: number;
    readonly SIGNALED: number;
    readonly ALREADY_SIGNALED: number;
    readonly TIMEOUT_EXPIRED: number;
    readonly CONDITION_SATISFIED: number;
    readonly WAIT_FAILED: number;
    readonly SYNC_FLUSH_COMMANDS_BIT: number;
    // Misc
    readonly COLOR: number;
    readonly DEPTH: number;
    readonly STENCIL: number;
    readonly MIN: number;
    readonly MAX: number;
    readonly DEPTH_COMPONENT24: number;
    readonly STREAM_READ: number;
    readonly STREAM_COPY: number;
    readonly STATIC_READ: number;
    readonly STATIC_COPY: number;
    readonly DYNAMIC_READ: number;
    readonly DYNAMIC_COPY: number;
    readonly DEPTH_COMPONENT32F: number;
    readonly DEPTH32F_STENCIL8: number;
    readonly INVALID_INDEX: number;
    readonly TIMEOUT_IGNORED: number;
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: number;

    getIndexedParameter(target: number, index: number): WebGLBuffer | number | null;

    copyBufferSubData(readTarget: number, writeTarget: number, readOffset: number, writeOffset: number, size: number): void;

    getBufferSubData(target: number, srcByteOffset: number, dstData: ArrayBufferView | SharedArrayBuffer, dstOffset?: number, length?: number): void;

    blitFramebuffer(srcX0: number, srcY0: number, srcX1: number, srcY1: number, dstX0: number, dstY0: number, dstX1: number, dstY1: number, mask: number, filter: number): void;

    framebufferTextureLayer(target: number, attachment: number, texture: WebGLTexture, level: number, layer: number): void;

    invalidateFramebuffer(target: number, attachments: number[]): void;

    invalidateSubFramebuffer(target: number, attachments: number[], x: number, y: number, width: number, height: number): void;

    bufferData(target: number, srcDataOrSize: number | ArrayBufferView | ArrayBuffer | SharedArrayBuffer, usage: number, srcOffset?: number, length?: number): void;

    bufferSubData(target: number, dstByteOffset: number, srcData: ArrayBufferView | ArrayBuffer | SharedArrayBuffer, srcOffset?: number, length?: number): void;

    readBuffer(src: number): void;

    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, offset?: number): void;

    readPixels(x: number, y: number, width: number, height: number, format: number, type: number, dstData: ArrayBufferView | ArrayBuffer, dstOffset?: number): void;

    getInternalformatParameter(target: number, internalformat: number, pname: number): Int32Array | number | null;

    renderbufferStorageMultisample(target: number, samples: number, internalFormat: number, width: number, height: number): void;

    texStorage2D(target: number, levels: number, internalformat: number, width: number, height: number): void;

    texStorage3D(target: number, levels: number, internalformat: number, width: number, height: number, depth: number): void;

    //texImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset?: number): void;
    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, offset: number): void;

    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, source: ImageData | ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;

    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData?: ArrayBufferView): void;

    texImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;

    //texSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, type: number, srcData: ArrayBufferView, srcOffset: number): void;
    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, srcData?: ArrayBufferView, srcOffset?: number): void;

    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, pixels?: ImageData | ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): void;

    texSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, type: number, offset: number): void;

    copyTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, x: number, y: number, width: number, height: number): void;

    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, imageSize: number, offset: number): void;

    compressedTexImage2D(target: number, level: number, internalformat: number, width: number, height: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, offset: number): void;

    compressedTexImage3D(target: number, level: number, internalformat: number, width: number, height: number, depth: number, border: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, imageSize: number, offset: number): void;

    compressedTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number, width: number, height: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

    compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, offset: number): void;

    compressedTexSubImage3D(target: number, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, format: number, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: number): void;

    getFragDataLocation(program: WebGLProgram | null, name: string): number;

    uniform1ui(location: WebGLUniformLocation | null, x: number): void;

    uniform2ui(location: WebGLUniformLocation | null, x: number, y: number): void;

    uniform3ui(location: WebGLUniformLocation | null, x: number, y: number, z: number): void;

    uniform4ui(location: WebGLUniformLocation | null, x: number, y: number, z: number, w: number): void;

    uniform1fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform2fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform3fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform4fv(location: WebGLUniformLocation | null, data: Float32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform1iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform2iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform3iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform4iv(location: WebGLUniformLocation | null, data: Int32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform1uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform2uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform3uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniform4uiv(location: WebGLUniformLocation | null, data: Uint32Array | number[], srcOffset?: number, srcLength?: number): void;

    uniformMatrix2fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix3x2fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix4x2fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix2x3fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix3fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix4x3fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix2x4fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix3x4fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    uniformMatrix4fv(location: WebGLUniformLocation | null, transpose: boolean, data: Float32Array, srcOffset?: number, srcLength?: number): void;

    vertexAttribI4i(index: number, x: number, y: number, z: number, w: number): void;

    vertexAttribI4ui(index: number, x: number, y: number, z: number, w: number): void;

    vertexAttribI4iv(index: number, value: Int32Array | number[]): void;

    vertexAttribI4uiv(index: number, value: Uint32Array | number[]): void;

    vertexAttribIPointer(index: number, size: number, type: number, stride: number, offset: number): void;

    vertexAttribDivisor(index: number, divisor: number): void;

    drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void;

    drawElementsInstanced(mode: number, count: number, type: number, offset: number, instanceCount: number): void;

    drawRangeElements(mode: number, start: number, end: number, count: number, type: number, offset: number): void;

    drawBuffers(buffers: number[]): void;

    clearBufferfv(buffer: number, drawbuffer: number, values: Float32Array | number[], srcOffset?: number): void;

    clearBufferiv(buffer: number, drawbuffer: number, values: Int32Array | number[], srcOffset?: number): void;

    clearBufferuiv(buffer: number, drawbuffer: number, values: Uint32Array | number[], srcOffset?: number): void;

    clearBufferfi(buffer: number, drawbuffer: number, depth: number, stencil: number): void;

    createQuery(): WebGLQuery | null;

    deleteQuery(query: WebGLQuery | null): void;

    isQuery(query: WebGLQuery | null): boolean;

    beginQuery(target: number, query: WebGLQuery | null): void;

    endQuery(target: number): void;

    getQuery(target: number, pname: number): WebGLQuery | null;

    getQueryParameter(query: WebGLQuery | null, pname: number): number | boolean | null;

    createSampler(): WebGLSampler | null;

    deleteSampler(sampler: WebGLSampler | null): void;

    bindSampler(unit: number, sampler: WebGLSampler | null): void;

    isSampler(sampler: WebGLSampler | null): boolean;

    samplerParameteri(sampler: WebGLSampler | null, pname: number, param: number): void;

    samplerParameterf(sampler: WebGLSampler | null, pname: number, param: number): void;

    getSamplerParameter(sampler: WebGLSampler | null, pname: number): number | null;

    fenceSync(condition: number, flags: number): WebGLSync | null;

    isSync(sync: WebGLSync | null): boolean;

    deleteSync(sync: WebGLSync | null): void;

    clientWaitSync(sync: WebGLSync | null, flags: number, timeout: number): number;

    waitSync(sync: WebGLSync | null, flags: number, timeout: number): void;

    getSyncParameter(sync: WebGLSync | null, pname: number): number | null;

    createTransformFeedback(): WebGLTransformFeedback | null;

    deleteTransformFeedback(transformFeedback: WebGLTransformFeedback | null): void;

    isTransformFeedback(transformFeedback: WebGLTransformFeedback | null): void;

    bindTransformFeedback(target: number, transformFeedback: WebGLTransformFeedback | null): void;

    beginTransformFeedback(primitiveMode: number): void;

    endTransformFeedback(): void;

    transformFeedbackVaryins(program: WebGLProgram | null, varyings: string[], bufferMode: number): void;

    getTransformFeedbackVarying(program: WebGLProgram | null, index: number): WebGLActiveInfo;

    pauseTransformFeedback(): void;

    resumeTransformFeedback(): void;

    bindBufferBase(target: number, index: number, buffer: WebGLBuffer | null): void;

    bindBufferRange(target: number, index: number, buffer: WebGLBuffer | null, offset: number, size: number): void;

    getUniformIndices(program: WebGLProgram | null, uniformNames: string[]): number[] | null;

    getActiveUniforms(program: WebGLProgram | null, uniformIndices: number[], pname: number): number[] | boolean[] | null;

    getUniformBlockIndex(program: WebGLProgram | null, uniformBlockName: string): number[];

    getActiveUniformBlockParameter(program: WebGLProgram | null, uniformBlockIndex: number, pname: number): Uint32Array | number | boolean | null;

    getActiveUniformBlockName(program: WebGLProgram | null, uniformBlockIndex: number): string | null;

    uniformBlockBinding(program: WebGLProgram | null, uniformBlockIndex: number, uniformBlockBinding: number): void;

    createVertexArray(): WebGLVertexArrayObject | null;

    deleteVertexArray(vertexArray: WebGLVertexArrayObject | null): void;

    isVertexArray(vertexArray: WebGLVertexArrayObject | null): boolean;

    bindVertexArray(vertexArray: WebGLVertexArrayObject | null): void;
}


declare var WebGL2RenderingContext: {
    prototype: WebGL2RenderingContext;
    new(): WebGL2RenderingContext;

    // Getting GL parameter information
    readonly READ_BUFFER: number;
    readonly UNPACK_ROW_LENGTH: number;
    readonly UNPACK_SKIP_ROWS: number;
    readonly UNPACK_SKIP_PIXELS: number;
    readonly PACK_ROW_LENGTH: number;
    readonly PACK_SKIP_ROWS: number;
    readonly PACK_SKIP_PIXELS: number;
    readonly TEXTURE_BINDING_3D: number;
    readonly UNPACK_SKIP_IMAGES: number;
    readonly UNPACK_IMAGE_HEIGHT: number;
    readonly MAX_3D_TEXTURE_SIZE: number;
    readonly MAX_ELEMENTS_VERTICES: number;
    readonly MAX_ELEMENTS_INDICES: number;
    readonly MAX_TEXTURE_LOD_BIAS: number;
    readonly MAX_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly MAX_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_ARRAY_TEXTURE_LAYERS: number;
    readonly MIN_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_PROGRAM_TEXEL_OFFSET: number;
    readonly MAX_VARYING_COMPONENTS: number;
    readonly FRAGMENT_SHADER_DERIVATIVE_HINT: number;
    readonly RASTERIZER_DISCARD: number;
    readonly VERTEX_ARRAY_BINDING: number;
    readonly MAX_VERTEX_OUTPUT_COMPONENTS: number;
    readonly MAX_FRAGMENT_INPUT_COMPONENTS: number;
    readonly MAX_SERVER_WAIT_TIMEOUT: number;
    readonly MAX_ELEMENT_INDEX: number;

    // Textures
    readonly RED: number;
    readonly RGB8: number;
    readonly RGBA8: number;
    readonly RGB10_A2: number;
    readonly TEXTURE_3D: number;
    readonly TEXTURE_WRAP_R: number;
    readonly TEXTURE_MIN_LOD: number;
    readonly TEXTURE_MAX_LOD: number;
    readonly TEXTURE_BASE_LEVEL: number;
    readonly TEXTURE_MAX_LEVEL: number;
    readonly TEXTURE_COMPARE_MODE: number;
    readonly TEXTURE_COMPARE_FUNC: number;
    readonly SRGB: number;
    readonly SRGB8: number;
    readonly SRGB8_ALPHA8: number;
    readonly COMPARE_REF_TO_TEXTURE: number;
    readonly RGBA32F: number;
    readonly RGB32F: number;
    readonly RGBA16F: number;
    readonly RGB16F: number;
    readonly TEXTURE_2D_ARRAY: number;
    readonly TEXTURE_BINDING_2D_ARRAY: number;
    readonly R11F_G11F_B10F: number;
    readonly RGB9_E5: number;
    readonly RGBA32UI: number;
    readonly RGB32UI: number;
    readonly RGBA16UI: number;
    readonly RGB16UI: number;
    readonly RGBA8UI: number;
    readonly RGB8UI: number;
    readonly RGBA32I: number;
    readonly RGB32I: number;
    readonly RGBA16I: number;
    readonly RGB16I: number;
    readonly RGBA8I: number;
    readonly RGB8I: number;
    readonly RED_INTEGER: number;
    readonly RGB_INTEGER: number;
    readonly RGBA_INTEGER: number;
    readonly R8: number;
    readonly RG8: number;
    readonly R16F: number;
    readonly R32F: number;
    readonly RG16F: number;
    readonly RG32F: number;
    readonly R8I: number;
    readonly R8UI: number;
    readonly R16I: number;
    readonly R16UI: number;
    readonly R32I: number;
    readonly R32UI: number;
    readonly RG8I: number;
    readonly RG8UI: number;
    readonly RG16I: number;
    readonly RG16UI: number;
    readonly RG32I: number;
    readonly RG32UI: number;
    readonly R8_SNORM: number;
    readonly RG8_SNORM: number;
    readonly RGB8_SNORM: number;
    readonly RGBA8_SNORM: number;
    readonly RGB10_A2UI: number;
    readonly TEXTURE_IMMUTABLE_FORMAT: number;
    readonly TEXTURE_IMMUTABLE_LEVELS: number;

    // Compressed textures
    readonly COMPRESSED_R11_EAC: number;
    readonly COMPRESSED_SIGNED_R11_EAC: number;
    readonly COMPRESSED_RG11_EAC: number;
    readonly COMPRESSED_SIGNED_RG11_EAC: number;
    readonly COMPRESSED_RGB8_ETC2: number;
    readonly COMPRESSED_SRGB8_ETC2: number;
    readonly COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2: number;
    readonly COMPRESSED_SRGB8_ALPHA8_ETC2_EAC: number;

    // Pixel types
    readonly UNSIGNED_INT_2_10_10_10_REV: number;
    readonly UNSIGNED_INT_10F_11F_11F_REV: number;
    readonly UNSIGNED_INT_5_9_9_9_REV: number;
    readonly FLOAT_32_UNSIGNED_INT_24_8_REV: number;
    readonly UNSIGNED_INT_24_8: number;
    readonly HALF_FLOAT: number;
    readonly RG: number;
    readonly RG_INTEGER: number;
    readonly INT_2_10_10_10_REV: number;

    // Queries
    readonly CURRENT_QUERY: number;
    readonly QUERY_RESULT: number;
    readonly QUERY_RESULT_AVAILABLE: number;
    readonly ANY_SAMPLES_PASSED: number;
    readonly ANY_SAMPLES_PASSED_CONSERVATIVE: number;

    // Draw buffers
    readonly MAX_DRAW_BUFFERS: number;
    readonly DRAW_BUFFER0: number;
    readonly DRAW_BUFFER1: number;
    readonly DRAW_BUFFER2: number;
    readonly DRAW_BUFFER3: number;
    readonly DRAW_BUFFER4: number;
    readonly DRAW_BUFFER5: number;
    readonly DRAW_BUFFER6: number;
    readonly DRAW_BUFFER7: number;
    readonly DRAW_BUFFER8: number;
    readonly DRAW_BUFFER9: number;
    readonly DRAW_BUFFER10: number;
    readonly DRAW_BUFFER11: number;
    readonly DRAW_BUFFER12: number;
    readonly DRAW_BUFFER13: number;
    readonly DRAW_BUFFER14: number;
    readonly DRAW_BUFFER15: number;
    readonly MAX_COLOR_ATTACHMENTS: number;
    readonly COLOR_ATTACHMENT1: number;
    readonly COLOR_ATTACHMENT2: number;
    readonly COLOR_ATTACHMENT3: number;
    readonly COLOR_ATTACHMENT4: number;
    readonly COLOR_ATTACHMENT5: number;
    readonly COLOR_ATTACHMENT6: number;
    readonly COLOR_ATTACHMENT7: number;
    readonly COLOR_ATTACHMENT8: number;
    readonly COLOR_ATTACHMENT9: number;
    readonly COLOR_ATTACHMENT10: number;
    readonly COLOR_ATTACHMENT11: number;
    readonly COLOR_ATTACHMENT12: number;
    readonly COLOR_ATTACHMENT13: number;
    readonly COLOR_ATTACHMENT14: number;
    readonly COLOR_ATTACHMENT15: number;

    // Samplers
    readonly SAMPLER_3D: number;
    readonly SAMPLER_2D_SHADOW: number;
    readonly SAMPLER_2D_ARRAY: number;
    readonly SAMPLER_2D_ARRAY_SHADOW: number;
    readonly SAMPLER_CUBE_SHADOW: number;
    readonly INT_SAMPLER_2D: number;
    readonly INT_SAMPLER_3D: number;
    readonly INT_SAMPLER_CUBE: number;
    readonly INT_SAMPLER_2D_ARRAY: number;
    readonly UNSIGNED_INT_SAMPLER_2D: number;
    readonly UNSIGNED_INT_SAMPLER_3D: number;
    readonly UNSIGNED_INT_SAMPLER_CUBE: number;
    readonly UNSIGNED_INT_SAMPLER_2D_ARRAY: number;
    readonly MAX_SAMPLES: number;
    readonly SAMPLER_BINDING: number;

    // Buffers
    readonly PIXEL_PACK_BUFFER: number;
    readonly PIXEL_UNPACK_BUFFER: number;
    readonly PIXEL_PACK_BUFFER_BINDING: number;
    readonly PIXEL_UNPACK_BUFFER_BINDING: number;
    readonly COPY_READ_BUFFER: number;
    readonly COPY_WRITE_BUFFER: number;
    readonly COPY_READ_BUFFER_BINDING: number;
    readonly COPY_WRITE_BUFFER_BINDING: number;

    // Data types
    readonly FLOAT_MAT2x3: number;
    readonly FLOAT_MAT2x4: number;
    readonly FLOAT_MAT3x2: number;
    readonly FLOAT_MAT3x4: number;
    readonly FLOAT_MAT4x2: number;
    readonly FLOAT_MAT4x3: number;
    readonly UNSIGNED_INT_VEC2: number;
    readonly UNSIGNED_INT_VEC3: number;
    readonly UNSIGNED_INT_VEC4: number;
    readonly UNSIGNED_NORMALIZED: number;
    readonly SIGNED_NORMALIZED: number;

    // Vertex attributes
    readonly VERTEX_ATTRIB_ARRAY_INTEGER: number;
    readonly VERTEX_ATTRIB_ARRAY_DIVISOR: number;

    // Transform feedback
    readonly TRANSFORM_FEEDBACK_BUFFER_MODE: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: number;
    readonly TRANSFORM_FEEDBACK_VARYINGS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_START: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_SIZE: number;
    readonly TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN: number;
    readonly MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: number;
    readonly MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: number;
    readonly INTERLEAVED_ATTRIBS: number;
    readonly SEPARATE_ATTRIBS: number;
    readonly TRANSFORM_FEEDBACK_BUFFER: number;
    readonly TRANSFORM_FEEDBACK_BUFFER_BINDING: number;
    readonly TRANSFORM_FEEDBACK: number;
    readonly TRANSFORM_FEEDBACK_PAUSED: number;
    readonly TRANSFORM_FEEDBACK_ACTIVE: number;
    readonly TRANSFORM_FEEDBACK_BINDING: number;

    // Framebuffers and renderbuffers
    readonly FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING: number;
    readonly FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE: number;
    readonly FRAMEBUFFER_ATTACHMENT_RED_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_GREEN_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_BLUE_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE: number;
    readonly FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE: number;
    readonly FRAMEBUFFER_DEFAULT: number;
    readonly DEPTH_STENCIL_ATTACHMENT: number;
    readonly DEPTH_STENCIL: number;
    readonly DEPTH24_STENCIL8: number;
    readonly DRAW_FRAMEBUFFER_BINDING: number;
    readonly READ_FRAMEBUFFER: number;
    readonly DRAW_FRAMEBUFFER: number;
    readonly READ_FRAMEBUFFER_BINDING: number;
    readonly RENDERBUFFER_SAMPLES: number;
    readonly FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER: number;
    readonly FRAMEBUFFER_INCOMPLETE_MULTISAMPLE: number;

    // Uniforms
    readonly UNIFORM_BUFFER: number;
    readonly UNIFORM_BUFFER_BINDING: number;
    readonly UNIFORM_BUFFER_START: number;
    readonly UNIFORM_BUFFER_SIZE: number;
    readonly MAX_VERTEX_UNIFORM_BLOCKS: number;
    readonly MAX_FRAGMENT_UNIFORM_BLOCKS: number;
    readonly MAX_COMBINED_UNIFORM_BLOCKS: number;
    readonly MAX_UNIFORM_BUFFER_BINDINGS: number;
    readonly MAX_UNIFORM_BLOCK_SIZE: number;
    readonly MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: number;
    readonly MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: number;
    readonly UNIFORM_BUFFER_OFFSET_ALIGNMENT: number;
    readonly ACTIVE_UNIFORM_BLOCKS: number;
    readonly UNIFORM_TYPE: number;
    readonly UNIFORM_SIZE: number;
    readonly UNIFORM_BLOCK_INDEX: number;
    readonly UNIFORM_OFFSET: number;
    readonly UNIFORM_ARRAY_STRIDE: number;
    readonly UNIFORM_MATRIX_STRIDE: number;
    readonly UNIFORM_IS_ROW_MAJOR: number;
    readonly UNIFORM_BLOCK_BINDING: number;
    readonly UNIFORM_BLOCK_DATA_SIZE: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORMS: number;
    readonly UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER: number;
    readonly UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER: number;

    // Sync objects
    readonly OBJECT_TYPE: number;
    readonly SYNC_CONDITION: number;
    readonly SYNC_STATUS: number;
    readonly SYNC_FLAGS: number;
    readonly SYNC_FENCE: number;
    readonly SYNC_GPU_COMMANDS_COMPLETE: number;
    readonly UNSIGNALED: number;
    readonly SIGNALED: number;
    readonly ALREADY_SIGNALED: number;
    readonly TIMEOUT_EXPIRED: number;
    readonly CONDITION_SATISFIED: number;
    readonly WAIT_FAILED: number;
    readonly SYNC_FLUSH_COMMANDS_BIT: number;

    // Misc
    readonly COLOR: number;
    readonly DEPTH: number;
    readonly STENCIL: number;
    readonly MIN: number;
    readonly MAX: number;
    readonly DEPTH_COMPONENT24: number;
    readonly STREAM_READ: number;
    readonly STREAM_COPY: number;
    readonly STATIC_READ: number;
    readonly STATIC_COPY: number;
    readonly DYNAMIC_READ: number;
    readonly DYNAMIC_COPY: number;
    readonly DEPTH_COMPONENT32F: number;
    readonly DEPTH32F_STENCIL8: number;
    readonly INVALID_INDEX: number;
    readonly TIMEOUT_IGNORED: number;
    readonly MAX_CLIENT_WAIT_TIMEOUT_WEBGL: number;
};

interface HTMLCanvasElement {
    getContext(contextId: "webgl2" | "experimental-webgl2", contextAttributes?: WebGLContextAttributes): WebGL2RenderingContext | null;
}