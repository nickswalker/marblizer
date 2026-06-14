import Vec2 from "../models/vector.js";
import Color from "../models/color.js";
import VectorField from "../models/vectorfield.js";

// A forward point displacement together with its analytic inverse.
// The vector renderer uses the forward map (atPoint) to move ink points.
// A future GPU back-mapping renderer uses the inverse to trace an output
// pixel back to where it came from. By construction these round-trip:
// inverseAtPoint(p.add(atPoint(p))) ≈ p.
export interface Displacement extends VectorField {
    inverseAtPoint(point: Vec2): Vec2;
}

// A disc of ink deposited on top of the field, after any displacement.
// The vector renderer tessellates it into a polygon; a GPU renderer can
// test pixel-in-disc containment directly against these parameters.
export interface InkDeposit {
    readonly color: Color;
    readonly radius: number;
    readonly center: Vec2;
}

// A backend-agnostic marbling operation. An operation may deform the
// existing field, deposit new ink, and/or change the base color. The
// renderer (vector or GPU) decides how to realize these effects, so
// operations never reach into renderer internals.
export default interface Operation {
    readonly displacement: Displacement | null;
    readonly deposit: InkDeposit | null;
    readonly newBaseColor: Color | null;
}

export class ChangeBaseColorOperation implements Operation {
    readonly displacement: Displacement | null = null;
    readonly deposit: InkDeposit | null = null;
    readonly newBaseColor: Color;

    constructor(color: Color) {
        this.newBaseColor = color;
    }
}
