import MarblingRenderer from "../curve_renderer.js";
import Operation from "../../operations/color_operations.js";
import Color from "../../models/color.js";
import Vec2 from "../../models/vector.js";
import {encodeOperations, FLOATS_PER_OP, resolveBaseColor} from "./op_buffer.js";
import {MARBLING_WGSL} from "./marbling_shader.js";

// WebGPU backend. A single full-screen fragment shader back-maps every pixel
// through the operation history newest-first (see marbling_shader.ts), so
// output is sharp at any resolution with no large intermediate buffers.
//
// To keep that walk from growing unbounded as a composition gets longer, the
// history is periodically baked into a "checkpoint" texture: every
// CHECKPOINT_INTERVAL committed ops, the current image is rendered into a
// texture and the storage buffer is reset to hold only ops since that bake.
// The shader's fallback (a pixel that fell through the active op window
// without resolving) samples the checkpoint texture instead of a flat colour.
// This bounds per-frame shader cost to the window size, which is also what
// makes a cheap live preview possible: previewOperations() renders the
// active window plus one tentative op straight to the screen, without ever
// touching the committed history.
//
// GPU-API objects are typed loosely (the project does not depend on
// @webgpu/types); the buffer/encoding logic is fully typed.
const BYTES_PER_OP = FLOATS_PER_OP * 4;
const UNIFORM_BYTES = 48; // resolution(8) + count(4) + dpr(4) + baseColor(16) + checkpointInfo(16)
const CHECKPOINT_INTERVAL = 64;

// GPUBufferUsage/GPUTextureUsage flag values from the WebGPU spec (the enums
// are runtime globals not present in the default TS lib, so we use the fixed
// bit values directly). The two enums share some numeric values but are not
// interchangeable; texture usages are kept separately named.
const USAGE_COPY_DST = 0x0008;
const USAGE_UNIFORM = 0x0040;
const USAGE_STORAGE = 0x0080;
const USAGE_TEXTURE_BINDING = 0x04;
const USAGE_RENDER_ATTACHMENT = 0x10;

export default class WebGPURenderer implements MarblingRenderer {
    readonly displayCanvas: HTMLCanvasElement;
    baseColor: Color = new Color(220, 210, 210);
    private readonly defaultBaseColor: Color = new Color(220, 210, 210);

    private history: Operation[] = [];
    private readonly device: any;
    private readonly context: any;
    private readonly format: any;
    private readonly pipeline: any;
    private readonly uniformBuffer: any;
    private opBuffer: any = null;     // storage buffer, grown on demand
    private opCapacity = 0;            // capacity in ops
    private bindGroup: any = null;
    private checkpointSampler: any;
    private checkpointTexture: any;
    private checkpointView: any;
    // Number of leading ops from history already baked into checkpointTexture.
    // The active window the shader walks is history.slice(checkpointOpIndex).
    private checkpointOpIndex = 0;
    // Logical (CSS-pixel) size and device pixel ratio, used to scale
    // getColorsAt queries down to the device-pixel backing store.
    private cssWidth: number = 0;
    private cssHeight: number = 0;
    private dpr: number = 1;

    // Constructs a renderer, or throws if WebGPU is unavailable / fails to init.
    static async create(container: HTMLElement): Promise<WebGPURenderer> {
        const gpu = (navigator as any).gpu;
        if (!gpu) {
            throw new Error("WebGPU not available (navigator.gpu is undefined)");
        }
        const adapter = await gpu.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPU: no GPU adapter");
        }
        const device = await adapter.requestDevice();
        return new WebGPURenderer(container, gpu, device);
    }

    private constructor(container: HTMLElement, gpu: any, device: any) {
        this.device = device;
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        container.insertBefore(this.displayCanvas, container.firstChild);

        this.context = this.displayCanvas.getContext("webgpu");
        this.format = gpu.getPreferredCanvasFormat();
        this.context.configure({device, format: this.format, alphaMode: "premultiplied"});

        const module = device.createShaderModule({code: MARBLING_WGSL});
        this.pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {module, entryPoint: "vs"},
            fragment: {module, entryPoint: "fs", targets: [{format: this.format}]},
            primitive: {topology: "triangle-list"},
        });

        this.uniformBuffer = device.createBuffer({
            size: UNIFORM_BYTES,
            usage: USAGE_UNIFORM | USAGE_COPY_DST,
        });

        this.checkpointSampler = device.createSampler({magFilter: "linear", minFilter: "linear"});
        // 1x1 placeholder; never sampled while checkpointOpIndex is 0 (the
        // shader skips the checkpoint branch entirely), but a valid bound
        // resource is still required by the API.
        this.checkpointTexture = this.createCheckpointTexture(1, 1);
        this.checkpointView = this.checkpointTexture.createView();

        this.ensureOpCapacity(1);
    }

    private createCheckpointTexture(width: number, height: number): any {
        return this.device.createTexture({
            size: [Math.max(1, width), Math.max(1, height)],
            format: this.format,
            usage: USAGE_TEXTURE_BINDING | USAGE_RENDER_ATTACHMENT,
        });
    }

    setSize(width: number, height: number) {
        // Backing store is sized in physical pixels for sharpness on
        // high-DPI displays; the shader maps fragment coords back down by
        // dpr (see marbling_shader.ts) so they line up with the CSS-pixel
        // coordinates the operations are authored in.
        this.cssWidth = width;
        this.cssHeight = height;
        this.dpr = window.devicePixelRatio || 1;
        this.displayCanvas.width = Math.round(width * this.dpr);
        this.displayCanvas.height = Math.round(height * this.dpr);
        this.render();
    }

    reset() {
        this.history = [];
        this.baseColor = this.defaultBaseColor;
        this.checkpointOpIndex = 0;
        this.checkpointTexture.destroy();
        this.checkpointTexture = this.createCheckpointTexture(1, 1);
        this.checkpointView = this.checkpointTexture.createView();
        this.rebuildBindGroup();
        this.render();
    }

    getHistory(): Operation[] {
        return this.history;
    }

    applyOperations(operations: Operation[]) {
        for (let i = 0; i < operations.length; i++) {
            this.history.push(operations[i]);
        }
        this.render();
    }

    save() {
        this.render();
        const dataURL = this.displayCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "ink-marbling-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async getColorsAt(points: Vec2[]): Promise<(Color | null)[]> {
        this.render();
        const dataURL = this.displayCanvas.toDataURL("image/png");
        const bitmap = await createImageBitmap(await (await fetch(dataURL)).blob());
        const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = offscreen.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);
        return points.map((point) => {
            if (point.x < 0 || point.y < 0 || point.x >= this.cssWidth || point.y >= this.cssHeight) {
                return null;
            }
            const [r, g, b, a] = ctx.getImageData(Math.round(point.x * this.dpr), Math.round(point.y * this.dpr), 1, 1).data;
            return new Color(r, g, b, a / 255);
        });
    }

    private ensureOpCapacity(ops: number) {
        const needed = Math.max(1, ops);
        if (this.opBuffer != null && this.opCapacity >= needed) {
            return;
        }
        if (this.opBuffer != null) {
            this.opBuffer.destroy();
        }
        this.opCapacity = needed;
        this.opBuffer = this.device.createBuffer({
            size: needed * BYTES_PER_OP,
            usage: USAGE_STORAGE | USAGE_COPY_DST,
        });
        this.rebuildBindGroup();
    }

    private rebuildBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {binding: 0, resource: {buffer: this.uniformBuffer}},
                {binding: 1, resource: {buffer: this.opBuffer}},
                {binding: 2, resource: this.checkpointSampler},
                {binding: 3, resource: this.checkpointView},
            ],
        });
    }

    // Bakes everything up to (and including) uptoIndex into a fresh
    // checkpoint texture, sampling the *existing* checkpoint (still bound at
    // this point) as the fallback beneath the ops being baked. Cost is
    // bounded by the window being baked (at most CHECKPOINT_INTERVAL ops),
    // not by total history length.
    private bakeCheckpoint(uptoIndex: number) {
        const windowOps = this.history.slice(this.checkpointOpIndex, uptoIndex);
        const hadCheckpoint = this.checkpointOpIndex > 0;
        const base = resolveBaseColor(this.history, this.baseColor);

        const newTexture = this.createCheckpointTexture(this.displayCanvas.width, this.displayCanvas.height);
        const newView = newTexture.createView();

        this.writeOpsAndUniforms(windowOps, base, hadCheckpoint);
        this.runRenderPass(newView, base);

        this.checkpointTexture.destroy();
        this.checkpointTexture = newTexture;
        this.checkpointView = newView;
        this.checkpointOpIndex = uptoIndex;
        this.rebuildBindGroup();
    }

    private writeOpsAndUniforms(windowOps: Operation[], base: Color, hasCheckpoint: boolean) {
        const {data, count} = encodeOperations(windowOps);
        this.ensureOpCapacity(count);
        if (count > 0) {
            this.device.queue.writeBuffer(this.opBuffer, 0, data);
        }

        const uniforms = new ArrayBuffer(UNIFORM_BYTES);
        const f = new Float32Array(uniforms);
        const u = new Uint32Array(uniforms);
        f[0] = this.displayCanvas.width;
        f[1] = this.displayCanvas.height;
        u[2] = count;
        f[3] = this.dpr;
        f[4] = base.r / 255;
        f[5] = base.g / 255;
        f[6] = base.b / 255;
        f[7] = 1;
        f[8] = hasCheckpoint ? 1 : 0;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);
    }

    private runRenderPass(colorAttachmentView: any, base: Color) {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: colorAttachmentView,
                clearValue: {r: base.r / 255, g: base.g / 255, b: base.b / 255, a: 1},
                loadOp: "clear",
                storeOp: "store",
            }],
        });
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        pass.draw(3);
        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    private render() {
        if (this.history.length - this.checkpointOpIndex >= CHECKPOINT_INTERVAL) {
            this.bakeCheckpoint(this.history.length);
        }
        const windowOps = this.history.slice(this.checkpointOpIndex);
        const base = resolveBaseColor(this.history, this.baseColor);
        this.writeOpsAndUniforms(windowOps, base, this.checkpointOpIndex > 0);
        this.runRenderPass(this.context.getCurrentTexture().createView(), base);
    }

    // Renders the committed active window plus the given tentative ops
    // straight to the screen, without touching history or the checkpoint.
    // Cost is bounded by the window size (<= CHECKPOINT_INTERVAL) regardless
    // of how long the overall composition is, which is what makes calling
    // this on every pointermove affordable.
    previewOperations(ops: Operation[]) {
        const windowOps = this.history.slice(this.checkpointOpIndex).concat(ops);
        const base = resolveBaseColor(this.history, this.baseColor);
        this.writeOpsAndUniforms(windowOps, base, this.checkpointOpIndex > 0);
        this.runRenderPass(this.context.getCurrentTexture().createView(), base);
    }

    // Restores the display to the actual committed state, discarding any
    // in-progress preview drawn by previewOperations().
    clearPreview() {
        this.render();
    }
}
