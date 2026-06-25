import {Tool, ToolParameterMap} from "./tools.js";
import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import InkDropOperation from "../operations/inkdrop.js";
import LineTine from "../operations/linetine.js";
import WavyLineTine from "../operations/wavylinetine.js";
import CircularLineTine from "../operations/circularlinetine.js";
import Vortex from "../operations/vortex.js";
import {counterclockwiseForDrag} from "../operations/rotation_direction.js";
import Color, {black} from "../models/color.js";

// Builds the candidate Operation that the in-progress drag/hover would
// commit for the active tool, without committing it. Shared by the
// vector-field arrow overlay and the ink preview overlay so both agree on
// exactly what each tool's gesture means. `color` only matters to callers
// that render the deposit (the ink preview); the arrow overlay only reads
// `displacement` and can pass anything.
export function buildPreviewOperation(tool: Tool, parameters: ToolParameterMap, mouseDownCoord: Vec2 | null, cursorCoord: Vec2 | null, color: Color = black): Operation | null {
    switch (tool) {
        case Tool.Drop: {
            if (cursorCoord == null) {
                return null;
            }
            return new InkDropOperation(cursorCoord, parameters['radius'], color);
        }
        case Tool.TineLine: {
            if (cursorCoord == null || mouseDownCoord == null) {
                return null;
            }
            const dir = cursorCoord.sub(mouseDownCoord);
            if (dir.length() <= 0.03) {
                return null;
            }
            return new LineTine(mouseDownCoord, dir, parameters['numTines'], parameters['spacing'], parameters['reach']);
        }
        case Tool.WavyLine: {
            if (cursorCoord == null || mouseDownCoord == null) {
                return null;
            }
            const dir = cursorCoord.sub(mouseDownCoord);
            if (dir.length() <= 0.03) {
                return null;
            }
            return new WavyLineTine(mouseDownCoord, dir, parameters['numTines'], parameters['spacing'], parameters['reach']);
        }
        case Tool.CircularTine: {
            if (cursorCoord == null || mouseDownCoord == null) {
                return null;
            }
            const direction = cursorCoord.sub(mouseDownCoord);
            const radius = direction.length();
            if (radius <= 0.03) {
                return null;
            }
            return new CircularLineTine(mouseDownCoord, radius, parameters['numTines'], parameters['spacing'], counterclockwiseForDrag(direction));
        }
        case Tool.Vortex: {
            if (cursorCoord == null || mouseDownCoord == null) {
                return null;
            }
            const direction = cursorCoord.sub(mouseDownCoord);
            const radius = direction.length();
            if (radius <= 0.03) {
                return null;
            }
            return new Vortex(mouseDownCoord, radius, counterclockwiseForDrag(direction));
        }
        default:
            return null;
    }
}
