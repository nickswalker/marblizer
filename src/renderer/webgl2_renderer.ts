import MarblingRenderer from "./curve_renderer.js";
import Operation from "../operations/color_operations.js";

import {createAndSetupTexture, resizeCanvasToDisplaySize} from "./../webgl_utils.js";
import Color from "../models/color.js";
import RasterApplicator from "../operations/raster_applicator.js";


export default class WebGL2Renderer implements MarblingRenderer {
    gl: WebGL2RenderingContext;
    textures: WebGLTexture[] = [];
    baseColor: Color = new Color(220, 210, 210);
    private displayCanvas: HTMLCanvasElement;
    private offscreenVAO: WebGLVertexArrayObject;
    private onscreenVAO: WebGLVertexArrayObject;
    private framebuffers: WebGLFramebuffer[] = [];
    private applicator: RasterApplicator;
    private dirty: boolean = false;
    private currentBuffer: number = 0;
    private onscreenBuffer: WebGLBuffer;
    private offscreenBuffer: WebGLBuffer;

    constructor(container: HTMLElement) {
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        container.insertBefore(this.displayCanvas, container.firstChild);

        window.requestAnimationFrame(this.draw.bind(this));

        const gl = this.displayCanvas.getContext("webgl2");

        if (!gl) {
            return;
        }
        this.gl = gl;


        // create 2 textures and attach them to framebuffers.
        for (let ii = 0; ii < 2; ++ii) {
            const texture = createAndSetupTexture(gl);
            this.textures.push(texture);

            // make the texture the same size as the image
            const mipLevel = 0;               // the largest mip
            const internalFormat = gl.RGBA;   // format we want in the texture
            const border = 0;                 // must be 0
            const srcFormat = gl.RGBA;        // format of data we are supplying
            const srcType = gl.UNSIGNED_BYTE;  // type of data we are supplying
            const data = null;
            //TODO: Have to think about resizing the window here.
            gl.texImage2D(
                gl.TEXTURE_2D, mipLevel, internalFormat, 4096, 4096, border,
                srcFormat, srcType, data);

            // Create a framebuffer
            const fbo = gl.createFramebuffer();
            this.framebuffers.push(fbo);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            // Attach a texture to it.
            const attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, mipLevel);
        }

        this.applicator = new RasterApplicator(gl, this);
        this.setColor(this.baseColor);

    }

    getTexturesForDrawing(): [any, any] {
        const current = this.currentBuffer % 2;
        const target = (this.currentBuffer + 1) % 2;
        ++this.currentBuffer;
        return [current, target];
    }

    getTexturesForDisplay(): [any, any] {
        const current = this.currentBuffer % 2;
        const target = (this.currentBuffer + 1) % 2;
        return [current, target];
    }

    draw() {
        if (!this.dirty) {
            window.requestAnimationFrame(this.draw.bind(this));
            return;
        }
        const gl = this.gl;
        this.applicator.renderProgram.load();
        resizeCanvasToDisplaySize(gl.canvas, 1/*window.devicePixelRatio*/);
        gl.bindVertexArray(this.onscreenVAO);
        // Bind the position buffer so gl.bufferData that will be called
        // in setRectangle puts data in the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.onscreenBuffer);
        setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height);

        setFramebuffer(gl, null, this.applicator.renderProgram.resolutionLocation, gl.canvas.width, gl.canvas.height);

        const [current, target] = this.getTexturesForDisplay();
        // Use the result in the target buffer to display to the screen
        gl.bindTexture(gl.TEXTURE_2D, this.textures[target]);

        this.renderTexture();
        this.dirty = false;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    renderTexture() {
        const gl = this.gl;
        // Draw the rectangle.
        const primitiveType = gl.TRIANGLES;
        const offset = 0;
        const count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    applyOperations(operations: Operation[]) {
        this.gl.bindVertexArray(this.offscreenVAO);
        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            this.applicator.apply(operation, this);
        }
        this.dirty = true;
    }

    save() {
    }

    reset() {
        this.setColor(this.baseColor);
    }

    setColor(color: Color) {
        const pixel1 = new ImageData(new Uint8ClampedArray([color.r, color.g, color.b, 255]), 1, 1);
        const pixel2 = new ImageData(new Uint8ClampedArray([0, color.g, color.b, 255]), 1, 1);
        const pixels = [pixel1, pixel2];
        const gl = this.gl;
        for (let i = 0; i < this.textures.length; i++) {

            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            // Upload the image into the texture.
            const mipLevel = 0;               // the largest mip
            const internalFormat = gl.RGBA;   // format we want in the texture
            const srcFormat = gl.RGBA;        // format of data we are supplying
            const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
            gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                pixels[i]);
        }
        this.dirty = true;
    }

    async set_image(src: string) {
        const gl = this.gl;
        const image = await loadImage(src);
        for (let i = 0; i < this.textures.length; i++) {
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            // Upload the image into the texture.
            const mipLevel = 0;               // the largest mip
            const internalFormat = gl.RGBA;   // format we want in the texture
            const srcFormat = gl.RGBA;        // format of data we are supplying
            const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
            gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                image);
        }
        setRectangle(gl, 0, 0, image.width, image.height);
    }

    setupVertexInfo(positionAttributeLocation: number, texCoordAttributeLocation: number) {
        const gl = this.gl;
        // Create a vertex array object (attribute state)
        this.onscreenVAO = gl.createVertexArray();
        this.onscreenBuffer = gl.createBuffer();
        this.configureVAO(this.onscreenVAO, positionAttributeLocation, texCoordAttributeLocation, this.onscreenBuffer);
        gl.bindVertexArray(this.onscreenVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.onscreenBuffer);
        // Set a rectangle the same size as the canvas.
        setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height);

        this.offscreenVAO = gl.createVertexArray();
        this.offscreenBuffer = gl.createBuffer();
        this.configureVAO(this.offscreenVAO, positionAttributeLocation, texCoordAttributeLocation, this.offscreenBuffer);
        gl.bindVertexArray(this.offscreenVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.offscreenBuffer);
        // Set a rectangle the same size as the canvas.
        setRectangle(gl, 0, 0, 4096, 4096);

    }

    swapToBuffer(target: number, resolutionLocation: WebGLUniformLocation, width = this.gl.canvas.width, height = this.gl.canvas.height) {
        setFramebuffer(this.gl, this.framebuffers[target], resolutionLocation, width, height);
    }

    setSize(width: number, height: number) {
    }

    private configureVAO(vao: WebGLVertexArrayObject, positionAttributeLocation: number, texCoordAttributeLocation: number, locationBuffer: WebGLBuffer) {
        const gl = this.gl;
        gl.bindVertexArray(vao);
        {
            // provide texture coordinates for the rectangle.
            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                1.0, 1.0,
            ]), gl.STATIC_DRAW);

            gl.enableVertexAttribArray(texCoordAttributeLocation);
            const size = 2;          // 2 components per iteration
            const type = gl.FLOAT;   // the data is 32bit floats
            const normalize = false; // don't normalize the data
            const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            const offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                texCoordAttributeLocation, size, type, normalize, stride, offset);
        }
        {
            // Turn on the attribute
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, locationBuffer);

            // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
            const size = 2;          // 2 components per iteration
            const type = gl.FLOAT;   // the data is 32bit floats
            const normalize = false; // don't normalize the data
            const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
            const offset = 0;        // start at the beginning of the buffer
            gl.vertexAttribPointer(
                positionAttributeLocation, size, type, normalize, stride, offset);
            // Must buffer data for this attribute outside
        }
    }
}

function setFramebuffer(gl, fbo, resolutionLocation, width, height) {
    //console.log(width, height);
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // Tell the shader the resolution of the framebuffer.
    gl.uniform2f(resolutionLocation, width, height);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, width, height);
}

async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function setRectangle(gl, x, y, width, height) {
    console.log(x, y, width, height);
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

function clearBuffer(gl) {
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}