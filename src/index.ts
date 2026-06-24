///<reference path=".d.ts"/>
import "./ui/icons.js";
import Vec2 from "./models/vector.js";
import {getParameterByName} from "./parse_query_string.js";
import UserProgram from "./scripting/user_program.js";
import {InteractiveCurveRenderer} from "./renderer/curve_renderer.js";
import WebGPURenderer from "./renderer/gpu/webgpu_renderer.js";
import WorkerCurveRenderer, {supportsOffscreenCanvas} from "./renderer/worker/worker_curve_renderer.js";
import MarblingUI from "./ui/ui.js";
import {loadCompositionDraft} from "./composition_storage.js";
import CompositionController from "./composition_controller.js";

type VectorRenderer = InteractiveCurveRenderer | WorkerCurveRenderer;
type Renderer = VectorRenderer | WebGPURenderer;

addEventListener('DOMContentLoaded', async function () {
    let marblingWorkspace = document.getElementById("workspace")!;
    let toolsPane = document.getElementById("tools")!;
    let optionsPane = document.getElementById("options")!;
    let colorsPane = document.getElementById("colors")!;
    let operationsInput = document.getElementById("operations-input")!;
    let ui = new MarblingUI(marblingWorkspace, toolsPane, optionsPane, colorsPane, operationsInput);

    // The vector renderer is always available and acts as the fallback. It
    // runs in a Worker (off the main thread) when the browser supports
    // transferring canvas control there, falling back to the main-thread
    // implementation otherwise. The WebGPU renderer is used when the browser
    // supports it; all backends implement the same MarblingRenderer interface
    // so the UI is agnostic to which is active.
    const vector: VectorRenderer = supportsOffscreenCanvas()
        ? new WorkerCurveRenderer(marblingWorkspace, "/dist/renderer/worker/curve_worker.js")
        : new InteractiveCurveRenderer(marblingWorkspace);
    let gpu: WebGPURenderer | null = null;
    try {
        gpu = await WebGPURenderer.create(marblingWorkspace);
    } catch (e) {
        console.info("WebGPU unavailable, using the vector renderer.", e instanceof Error ? e.message : e);
    }

    let active: Renderer = gpu != null ? gpu : vector;
    const composition = new CompositionController(active);
    composition.onStateChanged(() => ui.syncHistoryControls());

    // Hide whichever backend is not active (both canvases overlay the workspace).
    vector.displayCanvas.style.display = active === vector ? "" : "none";
    if (gpu != null) {
        gpu.displayCanvas.style.display = active === gpu ? "" : "none";
    }

    ui.delegate = composition;

    function sizeAll() {
        vector.setSize(window.innerWidth, window.innerHeight);
        if (gpu != null) {
            gpu.setSize(window.innerWidth, window.innerHeight);
        }
        ui.size = new Vec2(window.innerWidth, window.innerHeight);
    }

    sizeAll();
    window.onresize = sizeAll;

    // Backend toggle button (in the options pane). Shown only when WebGPU is
    // available; switching replays the operation history into the target so
    // both renderers show the same image.
    const backendButton = document.querySelector(".toggle-renderer") as HTMLElement | null;

    function updateBackendButton() {
        if (backendButton == null || gpu == null) {
            return;
        }
        const onGpu = active === gpu;
        backendButton.textContent = onGpu ? "GPU" : "Vec";
        backendButton.title = onGpu
            ? "Rendering on the GPU (WebGPU) — click to use the vector renderer"
            : "Rendering with vectors — click to use the GPU (WebGPU)";
    }

    function switchTo(target: Renderer) {
        if (target === active) {
            return;
        }
        active.displayCanvas.style.display = "none";
        target.displayCanvas.style.display = "";
        active = target;
        composition.setRenderer(active);
        updateBackendButton();
    }

    if (backendButton != null && gpu != null) {
        backendButton.style.display = "";
        backendButton.onclick = () => switchTo(active === gpu ? vector : gpu!);
        updateBackendButton();
    }

    const parameter = getParameterByName("p");
    if (parameter != null && confirm("Execute passed in program?")) {
        const decompressed = LZString.decompressFromEncodedURIComponent(parameter);
        if (decompressed != null) {
            const program = new UserProgram(decompressed);
            composition.applyOperations(program.execute(new Vec2(window.innerWidth, window.innerHeight)));
        }
        const gc = (window as any).goatcounter;
        if (gc?.count) gc.count({ path: "marblizer.shared-script-load", event: true });
    } else if (parameter == null) {
        const draft = loadCompositionDraft();
        if (draft != null && draft.length > 0) {
            composition.restore(draft);
        }
    }

});
