import Color from "../models/color.js";
import Operation, {Displacement, InkDeposit} from "./color_operations.js";

// A single scatter session: all the non-displacing drops laid down while the
// mouse was held. Stored as one history entry so undo removes the whole spray,
// and serialized as a compact array.
//
// Renderers expand this into individual InkDrop entries at encoding time; the
// GPU shader and the vector CurveField never see ScatterOperation directly.
export default class ScatterOperation implements Operation {
    readonly drops: readonly InkDeposit[];
    readonly displacement: Displacement | null = null;
    readonly deposit: InkDeposit | null = null;
    readonly newBaseColor: Color | null = null;

    constructor(drops: readonly InkDeposit[]) {
        this.drops = drops;
    }
}