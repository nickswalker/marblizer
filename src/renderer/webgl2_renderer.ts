import MarblingRenderer from "./curve_renderer.js";
import Operation from "../operations/color_operations.js";

import {createAndSetupTexture, createProgramFromSources, resizeCanvasToDisplaySize} from "./../webgl_utils.js";
import Color from "../models/color.js";
import RasterApplicator from "../operations/raster_applicator.js";


export default class WebGL2Renderer implements MarblingRenderer {
    gl: WebGL2RenderingContext;
    textures: WebGLTexture[] = [];
    baseColor: Color = new Color(220, 210, 210);
    private displayCanvas: HTMLCanvasElement;
    private vao: any;
    private framebuffers: WebGLFramebuffer[] = [];
    private applicator: RasterApplicator;
    private dirty: boolean = false;
    private currentBuffer: number = 0;
    private resolutionLocation: any;

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
        this.applicator = new RasterApplicator(gl, this);


        // Create a vertex array object (attribute state)
        this.vao = gl.createVertexArray();


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
            //TODO: Have to think about resizing the window here. Maybe should use max texture size by default
            gl.texImage2D(
                gl.TEXTURE_2D, mipLevel, internalFormat, gl.canvas.width, gl.canvas.height, border,
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
        resizeCanvasToDisplaySize(gl.canvas, 1/*window.devicePixelRatio*/);

        const [current, target] = this.getTexturesForDisplay();
        // Use the result in the target buffer to display to the screen
        gl.bindTexture(gl.TEXTURE_2D, this.textures[target]);

        setFramebuffer(gl, null, this.resolutionLocation, gl.canvas.width, gl.canvas.height);

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
        const pixel = new ImageData(new Uint8ClampedArray([color.r, color.g, color.b, 255]), 1, 1);
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
                pixel);
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

    provideInfo(positionAttributeLocation: number, texCoordAttributeLocation: any, resolutionLocation: any) {
        this.prepareCoords(texCoordAttributeLocation);
        this.resolutionLocation = resolutionLocation;
        const gl = this.gl;

        // and make it the one we're currently working with
        gl.bindVertexArray(this.vao);
        // Create a buffer and put a single pixel space rectangle in
        // it (2 triangles)
        const positionBuffer = gl.createBuffer();

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // Bind the position buffer so gl.bufferData that will be called
        // in setRectangle puts data in the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Set a rectangle the same size as the image.
        setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height);
    }

    swapToBuffer(target: any) {
        setFramebuffer(this.gl, this.framebuffers[target], this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);
    }

    setSize(width: number, height: number) {
    }

    private prepareCoords(texCoordAttributeLocation) {
        const gl = this.gl;

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