import {Drop, InteractiveCurveRenderer} from "../renderer/curve_renderer.js";
import Vec2 from "../models/vector.js";
import Mat2x2 from "../models/matrix.js";
import Operation from "./color_operations.js";
import CircularLineTine from "./circularlinetine.js";
import LineTine, {fmod} from "./linetine.js";
import Vortex from "./vortex.js";
import InkDropOperation from "./inkdrop.js";
import WavyLineTine from "./wavylinetine.js";

export default class AtPointApplicator {

    applicators: { [key: string]: (op: Operation, Vec2) => Vec2 } = {
        InkDropOperation: inkDrop,
        CircularLineTine: circularTine,
        WavyLineTine: wavyLineTine,
        Vortex: vortex,
        LineTine: lineTine
    };

    apply(operation: Operation, renderer: InteractiveCurveRenderer) {
        if (operation instanceof InkDropOperation) {
            const op: InkDropOperation = <InkDropOperation>operation;
            let newDrop = new Drop(op.color, op.radius, op.position.x, op.position.y);
            if (op.displacing) {
                for (let d = 0; d < renderer.drops.length; d++) {
                    let drop = renderer.drops[d];
                    for (let p = 0; p < drop.points.length; p++) {
                        const oldPoint = drop.points[p];
                        const offset = inkDrop(op, oldPoint);
                        drop.points[p] = oldPoint.add(offset);
                    }
                    drop.makeDirty();
                }
            }

            renderer.drops.push(newDrop);
            return;

        }
        const applicator = this.applicators[operation.constructor.name];

        for (let d = 0; d < renderer.drops.length; d++) {
            let drop = renderer.drops[d];
            for (let p = 0; p < drop.points.length; p++) {
                const oldPoint = drop.points[p];
                const offset = applicator(operation, oldPoint);
                drop.points[p] = oldPoint.add(offset);
            }
            drop.makeDirty();
        }
    }

    atPoint(operation: Operation, point: Vec2): Vec2 {
        const applicator = this.applicators[operation.constructor.name];
        return applicator(operation, point);

    }


}


function circularTine(operation: CircularLineTine, point: Vec2): Vec2 {
    const pLessC = point.sub(operation.center);
    const pLessCLen = pLessC.length();
    const d = Math.abs(pLessCLen - operation.radius);
    const l = operation.alpha * operation.lambda / (d + operation.lambda);
    const theta = operation.counterClockwise ? -l / pLessCLen : l / pLessCLen;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
    const addend = pLessC.mult(mat);
    const trans = operation.center.add(addend);
    return trans.sub(point);
}

function lineTine(operation: LineTine, point: Vec2): Vec2 {
    let d = Math.abs(point.sub(operation.origin).dot(operation.normal));
    const halfSpace = operation.spacing / 2.0;

    if (d / operation.spacing < operation.numTines) {
        const test = fmod(d, operation.spacing);
        d = halfSpace - Math.abs(test - halfSpace);
    } else {
        d = d - operation.spacing * operation.numTines;
    }

    const factor = operation.alpha * operation.lambda / (d + operation.lambda);
    return operation.line.copy().scale(factor);
}

function vortex(operation: Vortex, point: Vec2): Vec2 {
    const pLessC = point.sub(operation.center);
    const pLessCLen = pLessC.length();
    const d = Math.abs(100 / operation.radius * pLessCLen);
    const l = operation.alpha * operation.lambda / (d + operation.lambda);
    const theta = this.counterclockwise ? -l / pLessCLen : l / pLessCLen;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const mat = new Mat2x2(cosT, sinT, -sinT, cosT);
    const addend = pLessC.mult(mat);
    const trans = operation.center.add(addend);
    return trans.sub(point);
}


function inkDrop(operation: InkDropOperation, point: Vec2): Vec2 {
    const radius2 = Math.pow(operation.radius, 2);
    const pointDir = point.sub(operation.position);
    const factor = Math.sqrt(1 + (radius2 / Math.pow(pointDir.length(), 2)));

    const newPoint = operation.position.add(pointDir.scale(factor));
    return newPoint.sub(point);

}

function wavyLineTine(operation: WavyLineTine, point: Vec2): Vec2 {
    const sinT = Math.sin(operation.angle);
    const cosT = Math.cos(operation.angle);

    const v = point.dot(new Vec2(sinT, -cosT));
    const factor = operation.amplitude * Math.sin(2 * Math.PI / operation.wavelength * v + operation.phase);

    return new Vec2(cosT, sinT).scale(factor);
}