///<reference path=".d.ts"/>
import Vec2 from "./models/vector.js";
import {getParameterByName} from "./parse_query_string.js";
import UserProgram from "./scripting/user_program.js";
import {colorSets} from "./models/color.js";
import {InteractiveCurveRenderer} from "./renderer/curve_renderer.js";
import WebGPURenderer from "./renderer/gpu/webgpu_renderer.js";
import MarblingUI from "./ui/ui.js";
import {clearCompositionDraft, loadCompositionDraft, saveCompositionDraft} from "./composition_storage.js";

type Renderer = InteractiveCurveRenderer | WebGPURenderer;

addEventListener('DOMContentLoaded', async function () {
    let marblingWorkspace = document.getElementById("workspace");
    let toolsPane = document.getElementById("tools");
    let optionsPane = document.getElementById("options");
    let colorsPane = document.getElementById("colors");
    let operationsInput = document.getElementById("operations-input");
    let ui = new MarblingUI(marblingWorkspace, toolsPane, optionsPane, colorsPane, operationsInput);

    // The vector renderer is always available and acts as the fallback. The
    // WebGPU renderer is used when the browser supports it; both implement the
    // same MarblingRenderer interface so the UI is agnostic to which is active.
    const vector = new InteractiveCurveRenderer(marblingWorkspace);
    let gpu: WebGPURenderer | null = null;
    try {
        gpu = await WebGPURenderer.create(marblingWorkspace);
    } catch (e) {
        console.info("WebGPU unavailable, using the vector renderer.", e instanceof Error ? e.message : e);
    }

    let active: Renderer = gpu != null ? gpu : vector;
    let suppressDraftPersistence = false;

    function persistDraft(renderer: Renderer) {
        const operations = renderer.getHistory();
        if (operations.length === 0) {
            clearCompositionDraft();
            return;
        }
        saveCompositionDraft(operations, new Vec2(window.innerWidth, window.innerHeight));
    }

    function attachDraftPersistence(renderer: Renderer) {
        const applyOperations = renderer.applyOperations.bind(renderer);
        const reset = renderer.reset.bind(renderer);

        renderer.applyOperations = (operations) => {
            applyOperations(operations);
            if (!suppressDraftPersistence) {
                persistDraft(renderer);
            }
        };

        renderer.reset = () => {
            reset();
            if (!suppressDraftPersistence) {
                clearCompositionDraft();
            }
        };
    }

    attachDraftPersistence(vector);
    if (gpu != null) {
        attachDraftPersistence(gpu);
    }

    // Hide whichever backend is not active (both canvases overlay the workspace).
    vector.displayCanvas.style.display = active === vector ? "" : "none";
    if (gpu != null) {
        gpu.displayCanvas.style.display = active === gpu ? "" : "none";
    }

    ui.delegate = active;

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
        suppressDraftPersistence = true;
        try {
            target.reset();
            target.setSize(window.innerWidth, window.innerHeight);
            target.applyOperations(active.getHistory());
        } finally {
            suppressDraftPersistence = false;
        }
        active.displayCanvas.style.display = "none";
        target.displayCanvas.style.display = "";
        active = target;
        ui.delegate = active;
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
        const program = new UserProgram(decompressed);
        active.applyOperations(program.execute(new Vec2(window.innerWidth, window.innerHeight)));
    } else if (parameter == null) {
        const draft = loadCompositionDraft();
        if (draft != null && draft.length > 0) {
            active.applyOperations(draft);
        }
    }

    const palette = [];
    for (let i = 0; i < colorSets.length; i++) {
        palette.push([]);
        for (let j = 0; j < colorSets[0].length; j++) {
            palette[i].push(colorSets[i][j].toHexString());
        }
    }
    $("input[type='color'].foreground").spectrum({
        showPalette: true,
        preferredFormat: "hex",
        showSelectionPalette: true,
        maxSelectionSize: 5,
        palette: palette,
        replacerClassName: "foreground-spectrum"
    });
    $("input[type='color'].background").spectrum({
        showPalette: true,
        preferredFormat: "hex",
        showSelectionPalette: true,
        maxSelectionSize: 5,
        palette: palette,
        replacerClassName: "background-spectrum"
    });

    const event = new CustomEvent("colorPickersInstalled");
    document.dispatchEvent(event);

});
