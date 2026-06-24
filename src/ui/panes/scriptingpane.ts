///<reference path="../../.d.ts"/>
import {tutorialProgram} from "../../scripting/example_scripts.js";
import {showNotification} from "../components/notification.js";
import {basicSetup, EditorView} from "codemirror";
import {Compartment, EditorState} from "@codemirror/state";
import {javascript} from "@codemirror/lang-javascript";
import { solarizedDark } from 'cm6-theme-solarized-dark'
import {downloadText} from "../../util/download.js";
import ApiDocsDialog from "../components/api-docs-dialog.js";

export default class ScriptingPane {
    container: HTMLElement;
    modal: HTMLElement;
    callback!: (input: string | null) => void;
    active: boolean = false;
    private codeMirror: EditorView;
    private runButton: HTMLElement;
    private dismissButton: HTMLElement;
    private getURL: HTMLElement;
    private uploadButton: HTMLElement;
    private downloadButton: HTMLElement;
    private apiDocsButton: HTMLElement;
    private fileInput: HTMLInputElement;
    private apiDocsDialog: ApiDocsDialog;
    private downOnContainer: boolean = false;

    constructor(element: HTMLElement) {
        this.container = element.parentElement!;
        this.modal = element;
        this.dismissButton = <HTMLElement>element.querySelector(".close-button")!;
        this.runButton = <HTMLElement>element.querySelector(".run-button")!;
        this.getURL = <HTMLElement>element.querySelector(".get-url-button")!;
        this.uploadButton = <HTMLElement>element.querySelector(".upload-button")!;
        this.downloadButton = <HTMLElement>element.querySelector(".download-button")!;
        this.apiDocsButton = <HTMLElement>element.querySelector(".api-docs-button")!;
        this.codeMirror = new EditorView({
            parent: <HTMLElement>element.querySelector(".input-container")!,
            state: EditorState.create({ doc: tutorialProgram,             extensions: [basicSetup, solarizedDark, javascript()]}),

        });

        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.accept = ".js,text/javascript";
        this.fileInput.style.display = "none";
        document.body.appendChild(this.fileInput);
        this.fileInput.onchange = this.didChooseFile.bind(this);

        this.apiDocsDialog = new ApiDocsDialog();
        document.body.appendChild(this.apiDocsDialog);

        this.runButton.onclick = this.didClickConfirm.bind(this);
        this.dismissButton.onclick = this.didClickDismiss.bind(this);
        this.getURL.onclick = this.didClickGetURL.bind(this);
        this.uploadButton.onclick = this.didClickUpload.bind(this);
        this.downloadButton.onclick = this.didClickDownload.bind(this);
        this.apiDocsButton.onclick = this.didClickApiDocs.bind(this);
        this.container.onmouseup = this.upContainer.bind(this);
        this.container.onmousedown = this.downContainer.bind(this);
    }

    getInput(callback: (input: string | null) => void) {
        this.callback = callback;
        this.show();
    }

    hide() {
        this.active = false;
        this.container.style.visibility = "hidden";
        this.container.style.display = "none";
    }

    show() {
        this.active = true;
        this.container.removeAttribute("style");
    }

    private downContainer(event: MouseEvent) {
        this.downOnContainer = event.target == this.container;
    }

    private upContainer(event: MouseEvent) {
        if (event.target == this.container && this.downOnContainer) {
            this.hide();
            this.callback(null);
        }
        this.downOnContainer = false;

    }

    private didClickConfirm(event: MouseEvent) {
        this.hide();
        this.callback(this.codeMirror.state.doc.toString());
    }

    private didClickDismiss(event: MouseEvent) {
        this.hide();
        this.callback(null);
    }

    private didClickGetURL() {
        const program = LZString.compressToEncodedURIComponent(this.codeMirror.state.doc.toString());
        const base = window.location;
        const baseUrl = base.protocol + "//" + base.host + "/" + base.pathname.split('/')[1];

        showNotification(baseUrl + "?p=" + program);
        const gc = (window as any).goatcounter;
        if (gc?.count) gc.count({ path: "marblizer.share-script", event: true });
    }

    private didClickDownload() {
        downloadText("marbling-script.js", this.codeMirror.state.doc.toString(), "text/javascript;charset=utf-8");
    }

    private didClickUpload() {
        this.fileInput.value = "";
        this.fileInput.click();
    }

    private async didChooseFile() {
        const file = this.fileInput.files?.[0];
        if (file == null) {
            return;
        }
        const text = await file.text();
        this.codeMirror.dispatch({changes: {from: 0, to: this.codeMirror.state.doc.length, insert: text}});
    }

    private didClickApiDocs() {
        this.apiDocsDialog.show();
    }
}
