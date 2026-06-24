import Vec2 from "../models/vector.js";

// Shared by tools that rotate ink around a center point (Vortex, Circular
// tine): dragging into the upper half (above the mousedown point) spins
// counterclockwise, the lower half spins clockwise. The cursor's spin
// arrows (see SpinRenderer) are what make this discoverable.
export function counterclockwiseForDrag(direction: Vec2): boolean {
    return direction.y < 0;
}
