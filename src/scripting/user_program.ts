import Vec2 from "../models/vector.js";
import {colorSets} from "../models/color.js";
import CircularLineTine from "../operations/circularlinetine.js";
import InkDropOperation from "../operations/inkdrop.js";
import LineTine from "../operations/linetine.js";
import Vortex from "../operations/vortex.js";
import WavyLineTine from "../operations/wavylinetine.js";
import Operation from "../operations/color_operations.js";

export default class UserProgram {
    private executable: Function;

    constructor(string: string,) {

        this.executable = new Function(string);
        (globalThis as any).Vec2 = Vec2;
        (globalThis as any).CircularLineTine = CircularLineTine;
        (globalThis as any).InkDropOperation = InkDropOperation;
        (globalThis as any).LineTine = LineTine;
        (globalThis as any).Vortex = Vortex;
        (globalThis as any).WavyLineTine = WavyLineTine;
        (globalThis as any).colorSets = colorSets;
    }

    static fromBase64(binary: string): UserProgram {
        return new UserProgram(atob(binary));
    }

    asBase64String(): string {
        return btoa(this.executable.toString());
    }

    execute(canvasSize: Vec2): Operation[] {
        const scriptData = {canvasWidth: canvasSize.x, canvasHeight: canvasSize.y};
        return this.executable.bind(scriptData)();
    }

}
