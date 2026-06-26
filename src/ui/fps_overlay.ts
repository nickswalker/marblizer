// Debug HUD toggled by the "g" shortcut (see keyboard.ts/shortcuts.ts). Counts
// requestAnimationFrame callbacks to estimate the browser's actual paint rate
// (independent of whether the marbling content itself is changing), so a
// perpetual rAF loop is appropriate here unlike the other overlays, which all
// redraw only on change. The loop only runs while the HUD is visible.
export default class FpsOverlay {
    private readonly el: HTMLDivElement;
    private visible: boolean = false;
    private rafHandle: number = 0;
    private frameCount: number = 0;
    private windowStart: number = 0;

    constructor(container: HTMLElement) {
        this.el = document.createElement("div");
        this.el.className = "marbling-fps-overlay";
        this.el.style.visibility = "hidden";
        container.appendChild(this.el);
    }

    toggleVisibility() {
        this.visible = !this.visible;
        this.el.style.visibility = this.visible ? "visible" : "hidden";
        if (this.visible) {
            this.frameCount = 0;
            this.windowStart = performance.now();
            this.rafHandle = requestAnimationFrame(this.tick.bind(this));
        } else {
            cancelAnimationFrame(this.rafHandle);
        }
    }

    private tick(now: number) {
        if (!this.visible) {
            return;
        }
        this.frameCount++;
        const elapsed = now - this.windowStart;
        // Update the displayed number a few times a second rather than every
        // frame, since a number changing 60x/sec is unreadable.
        if (elapsed >= 250) {
            const fps = (this.frameCount * 1000) / elapsed;
            this.el.textContent = `${fps.toFixed(0)} fps`;
            this.frameCount = 0;
            this.windowStart = now;
        }
        this.rafHandle = requestAnimationFrame(this.tick.bind(this));
    }
}
