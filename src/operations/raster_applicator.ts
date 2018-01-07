import Operation from "./color_operations.js";
import InkDropOperation from "./inkdrop.js";
import WebGL2Renderer from "../renderer/webgl2_renderer.js";
import {createProgramFromSources} from "../webgl_utils.js";

const vertex = `#version 300 es

in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;
uniform float u_flipY;
out vec2 v_texCoord;

void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`;

const dotFragment = `#version 300 es

precision mediump float;

uniform sampler2D u_image;
in vec2 v_texCoord;
out vec4 outColor;

uniform vec2 u_center;
uniform float u_r;
uniform vec4 u_dotColor;

void main() {
  
  vec2 toOrigin = v_texCoord - u_center;
  float dist = sqrt(dot(toOrigin, toOrigin));
  if (dist >= u_r) {
      outColor = u_dotColor;
  } else {
      vec4 color = texture(u_image, v_texCoord);
      color.r += 1.0;
      outColor = vec4(color.rgb, 1);
  }
}
`;


const checkerFragment = `#version 300 es

precision mediump float;

uniform sampler2D u_image;
in vec2 v_texCoord;
out vec4 outColor;

uniform vec2 u_center;
uniform float u_r;
uniform vec4 u_dotColor;

void main() {

  outColor = vec4(1, 1, 1, 1);

  if (v_texCoord.x < u_center.x || v_texCoord.y < u_center.y) {
    outColor = vec4(0,0,0,1);
  }
    if (int(v_texCoord.x * 10.0) % 2 == 0 && int(v_texCoord.y * 10.0) % 2 == 0) {
      outColor = texture(u_image, v_texCoord);
  }
  
}
`;

const nopFragment = `#version 300 es

precision mediump float;

uniform sampler2D u_image;
in vec2 v_texCoord;
out vec4 outColor;

void main() {

    outColor = texture(u_image, v_texCoord);
    //outColor = vec4(1,0,1,1);
  
}
`;

export class ShaderProgram {

    imageLocation: WebGLUniformLocation;
    flipYLocation: WebGLUniformLocation;
    resolutionLocation: WebGLUniformLocation;
    positionAttributeLocation: number;
    texCoordAttributeLocation: number;
    flipDirty: boolean = false;
    protected rawProgram: WebGLProgram;
    protected gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext, components: string[]) {
        this.gl = gl;
        const attribs = ["a_position", "a_texCoord"];
        const locations = [0, 1];
        const program = createProgramFromSources(gl, components, attribs, locations);
        // The vertex shader is fixed for all operations
        this.imageLocation = gl.getUniformLocation(program, "u_image");
        this.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        this.texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
        this.flipYLocation = gl.getUniformLocation(program, "u_flipY");
        this.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        this.rawProgram = program;
        gl.useProgram(this.rawProgram);
        this.flip = false;
    }

    private _flip: boolean = false;

    set flip(value: boolean) {
        if (value != this._flip) {
            this.flipDirty = true;
            this._flip = value;
        }
    }

    instantiate(operation: Operation) {
        //Program must be loaded before this is called
        if (this.flipDirty) {
            this.gl.uniform1f(this.flipYLocation, this._flip ? -1 : 1);
        }
    }

    load() {
        const gl = this.gl;
        gl.useProgram(this.rawProgram);
        // Put the current image on unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(this.imageLocation, 0);
    }
}

class InkDropProgram extends ShaderProgram {
    private rLocation: WebGLUniformLocation;
    private centerLocation: WebGLUniformLocation;
    private dotColorLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext, components: string[]) {
        super(gl, components);
        this.dotColorLocation = gl.getUniformLocation(this.rawProgram, "u_dotColor");
        this.centerLocation = gl.getUniformLocation(this.rawProgram, "u_center");
        this.rLocation = gl.getUniformLocation(this.rawProgram, "u_r");
    }

    instantiate(operation: InkDropOperation) {
        super.instantiate(operation);
        const gl = this.gl;
        gl.uniform4f(this.dotColorLocation, operation.color.r, operation.color.g, operation.color.b, operation.color.a);
        gl.uniform2f(this.centerLocation, operation.position.x / gl.canvas.width, operation.position.y / gl.canvas.height);
        gl.uniform1f(this.rLocation, operation.radius);
    }
}

export default class RasterApplicator {

    public renderProgram: ShaderProgram;
    private programs: { [key: string]: ShaderProgram } = {};

    constructor(gl: any, renderer: WebGL2Renderer) {

        this.programs[InkDropOperation.name.toString()] = new InkDropProgram(gl, [vertex, checkerFragment]);
        this.renderProgram = new ShaderProgram(gl, [vertex, nopFragment]);

        this.renderProgram = this.programs[InkDropOperation.name.toString()];
        this.renderProgram.flip = true;
        renderer.setupVertexInfo(this.renderProgram.positionAttributeLocation, this.renderProgram.texCoordAttributeLocation);
    }

    apply(operation: Operation, renderer: WebGL2Renderer) {
        const gl = renderer.gl;
        const program = this.programs[operation.constructor.name];
        program.load();
        program.instantiate(operation);
        const [current, target] = renderer.getTexturesForDrawing();
        //console.log(current, target);

        gl.bindTexture(gl.TEXTURE_2D, renderer.textures[current]);

        // Setup to draw into the target buffer. Here we use the texture size
        renderer.swapToBuffer(target, program.resolutionLocation, 4096, 4096);

        renderer.renderTexture();
    }


}



