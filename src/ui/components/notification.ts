import {css, html, TemplateResult} from "lit";
import Overlay from "./overlay.js";

// A lightweight one-shot overlay used to surface a value the user will want to
// copy (currently the share URL). The text is selectable, and the element
// removes itself from the DOM once dismissed.
export default class MarblingNotification extends Overlay {
    static properties = {
        ...Overlay.properties,
        text: {type: String},
        heading_: {type: String},
    };

    text = "";
    heading_ = "";

    static styles = [
        Overlay.styles,
        css`
            .text {
                user-select: all;
                word-break: break-all;
                font-family: monospace;
            }
        `,
    ];

    protected heading(): string {
        return this.heading_;
    }

    protected willDismiss() {
        this.remove();
    }

    protected content(): TemplateResult {
        return html`<div class="text">${this.text}</div>`;
    }
}

customElements.define("marbling-notification", MarblingNotification);

// Convenience helper mirroring the old `new UINotification(...).show()` usage.
export function showNotification(text: string, heading = "Shareable URL"): MarblingNotification {
    const notification = new MarblingNotification();
    notification.text = text;
    notification.heading_ = heading;
    document.body.appendChild(notification);
    notification.show();
    return notification;
}
