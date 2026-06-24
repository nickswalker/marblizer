import Vec2 from "../models/vector.js";
import Color, {colorSets} from "../models/color.js";
import CircularLineTine from "../operations/circularlinetine.js";
import InkDropOperation from "../operations/inkdrop.js";
import LineTine from "../operations/linetine.js";
import Vortex from "../operations/vortex.js";
import WavyLineTine from "../operations/wavylinetine.js";
import Operation, {ChangeBaseColorOperation} from "../operations/color_operations.js";

// Globals available to a user script, fetched once per process since they
// never change across script runs.
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;

// Context supplied per run, since it depends on the live drawing state.
export interface UserProgramContext {
    history: Operation[];
    foregroundColor: Color;
    backgroundColor: Color;
    getColorsAt: (points: Vec2[]) => Promise<(Color | null)[]>;
}

export default class UserProgram {
    private executable: Function;

    constructor(string: string,) {

        this.executable = new AsyncFunction(string);
        (globalThis as any).Vec2 = Vec2;
        (globalThis as any).Color = Color;
        (globalThis as any).CircularLineTine = CircularLineTine;
        (globalThis as any).InkDropOperation = InkDropOperation;
        (globalThis as any).LineTine = LineTine;
        (globalThis as any).Vortex = Vortex;
        (globalThis as any).WavyLineTine = WavyLineTine;
        (globalThis as any).ChangeBaseColorOperation = ChangeBaseColorOperation;
        (globalThis as any).colorSets = colorSets;
    }

    static fromBase64(binary: string): UserProgram {
        return new UserProgram(atob(binary));
    }

    asBase64String(): string {
        return btoa(this.executable.toString());
    }

    async execute(canvasSize: Vec2, context: UserProgramContext): Promise<Operation[]> {
        const scriptData = {
            canvasWidth: canvasSize.x,
            canvasHeight: canvasSize.y,
            history: context.history,
            foregroundColor: context.foregroundColor,
            backgroundColor: context.backgroundColor,
            colorAt: async (point: Vec2): Promise<Color | null> => (await context.getColorsAt([point]))[0],
            colorsAt: (points: Vec2[]): Promise<(Color | null)[]> => context.getColorsAt(points),
        };
        return this.executable.bind(scriptData)();
    }

}
