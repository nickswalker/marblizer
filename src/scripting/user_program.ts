import Vec2 from "../models/vector.js";
import {colorSets} from "../models/color.js";
import CircularLineTine from "../operations/circularlinetine.js";
import InkDropOperation from "../operations/inkdrop.js";
import LineTine from "../operations/linetine.js";
import Vortex from "../operations/vortex.js";
import WavyLineTine from "../operations/wavylinetine.js";

export default class UserProgram {
    private executable: Function;

    constructor(string: string,) {

        this.executable = new Function(string);
        globalThis.Vec2 = Vec2;
        globalThis.CircularLineTine = CircularLineTine;
        globalThis.InkDropOperation = InkDropOperation;
        globalThis.LineTine = LineTine;
        globalThis.Vortex = Vortex;
        globalThis.WavyLineTine = WavyLineTine;
        globalThis.colorSets = colorSets;
    }

    static fromBase64(binary: string): UserProgram {
        return new UserProgram(atob(binary));
    }

    asBase64String(): string {
        return btoa(this.executable.toString());
    }

    execute(canvasSize: Vec2) {
        const scriptData = {canvasWidth: canvasSize.x, canvasHeight: canvasSize.y};
        return this.executable.bind(scriptData)();
    }

}