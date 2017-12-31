import Operation from "./color_operations.js";
import InkDropOperation from "./inkdrop.js";
import LineTine, {fmod} from "./linetine.js";
import WavyLineTine from "./wavylinetine.js";
import Vec2 from "../models/vector.js";
import CircularLineTine from "./circularlinetine.js";
import Vortex from "./vortex.js";
import WebGL2Renderer from "../renderer/webgl2_renderer.js";
import {createProgramFromSources} from "../webgl_utils.js";
import apply = Reflect.apply;
import Color, {black} from "../models/color.js";

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

export default class RasterApplicator {

    applicators: { [key: string]: (op: Operation, gl: any, program: any) => void } = {
        InkDropOperation: inkDrop,
        CircularLineTine: circularTine,
        WavyLineTine: wavyLineTine,
        Vortex: vortex,
        LineTine: lineTine
    };
    private programs: WebGLProgram[] = [];
    private imageLocation: WebGLUniformLocation;
    private flipYLocation: WebGLUniformLocation;
    private resolutionLocation: WebGLUniformLocation;
    private positionAttributeLocation: number;
    private texCoordAttributeLocation: number;

    constructor(gl: any, renderer: WebGL2Renderer) {
        // TODO: Compile programs
        const program = createProgramFromSources(gl, [vertex, dotFragment]);
        this.programs[InkDropOperation.name.toString()] = program;
        // By convention this is the first uniform for every fragment shader
        this.imageLocation = gl.getUniformLocation(program, "u_image");

        // The vertex shader is fixed for all operations
        this.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        this.texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");
        this.flipYLocation = gl.getUniformLocation(program, "u_flipY");
        this.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        renderer.provideInfo(this.positionAttributeLocation, this.texCoordAttributeLocation, this.resolutionLocation);

        // HACK: Load a program up by sending a noop through
        this.apply(new InkDropOperation(new Vec2(0, 0), 0, black, false), renderer);
    }

    apply(operation: Operation, renderer: WebGL2Renderer) {
        const gl = renderer.gl;
        const program = this.prepareProgram(operation, renderer);
        const [current, target] = renderer.getTexturesForDrawing();
        console.log(current, target);

        // Put the current image on unit 0
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, renderer.textures[current]);

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(this.imageLocation, 0);
        gl.uniform1f(this.flipYLocation, 1);

        // Setup to draw into the target buffer.
        renderer.swapToBuffer(target);

        renderer.renderTexture();
    }

    prepareProgram(operation: Operation, renderer: WebGL2Renderer) {
        const program = this.programs[operation.constructor.name];
        renderer.gl.useProgram(program);
        this.applicators[operation.constructor.name](operation, renderer.gl, program);
        return program
    }
}

function circularTine(operation: CircularLineTine, gl: any) {

}

function lineTine(operation: LineTine, point: Vec2) {

}

function vortex(operation: Vortex, point: Vec2) {

}


function inkDrop(operation: InkDropOperation, gl: any, program: any) {
    // lookup uniforms
    const dotColorLocation = gl.getUniformLocation(program, "u_dotColor");
    const centerLocation = gl.getUniformLocation(program, "u_center");
    const rLocation = gl.getUniformLocation(program, "u_r");
    gl.uniform4f(dotColorLocation, operation.color.r, operation.color.g, operation.color.b, operation.color.a);
    gl.uniform2f(centerLocation, operation.position.x, operation.position.y);
    gl.uniform1f(rLocation, operation.radius);

}

function wavyLineTine(operation: WavyLineTine, point: Vec2) {

}


