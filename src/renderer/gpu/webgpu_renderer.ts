import MarblingRenderer from "../curve_renderer.js";
import Operation from "../../operations/color_operations.js";
import Color from "../../models/color.js";
import {encodeOperations, FLOATS_PER_OP, resolveBaseColor} from "./op_buffer.js";
import {MARBLING_WGSL} from "./marbling_shader.js";

// WebGPU backend. It keeps no geometry of its own: the full operation history
// is uploaded to a storage buffer and a single full-screen fragment shader
// back-maps every pixel (see marbling_shader.ts). Output is sharp at any
// resolution and needs no large intermediate buffers.
//
// GPU-API objects are typed loosely (the project does not depend on
// @webgpu/types); the buffer/encoding logic is fully typed.
const BYTES_PER_OP = FLOATS_PER_OP * 4;
const UNIFORM_BYTES = 32; // resolution(8) + count(4) + pad(4) + baseColor(16)

// GPUBufferUsage flag values from the WebGPU spec (the enum is a runtime global
// not present in the default TS lib, so we use the fixed bit values directly).
const USAGE_COPY_DST = 0x0008;
const USAGE_UNIFORM = 0x0040;
const USAGE_STORAGE = 0x0080;

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
        this.ensureOpCapacity(1);
    }

    setSize(width: number, height: number) {
        // Match backing store to logical pixels so fragment coords line up with
        // the pixel-space coordinates the operations are authored in.
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.render();
    }

    reset() {
        this.history = [];
        this.baseColor = this.defaultBaseColor;
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
        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {binding: 0, resource: {buffer: this.uniformBuffer}},
                {binding: 1, resource: {buffer: this.opBuffer}},
            ],
        });
    }

    private render() {
        const {data, count} = encodeOperations(this.history);
        const base = resolveBaseColor(this.history, this.baseColor);

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
        f[4] = base.r / 255;
        f[5] = base.g / 255;
        f[6] = base.b / 255;
        f[7] = 1;
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
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
}
