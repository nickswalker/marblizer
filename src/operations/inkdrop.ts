import Operation, {Displacement, InkDeposit} from "./color_operations.js";
import Vec2 from "../models/vector.js";
import Color from "../models/color.js";

export default class InkDropOperation implements Operation, Displacement {
    readonly position: Vec2;
    readonly radius: number;
    readonly color: Color;
    readonly displacing: boolean;
    readonly newBaseColor: Color | null = null;

    constructor(position: Vec2, radius: number, color: Color, displacing: boolean = true) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.displacing = displacing;
    }

    // Only spreads the existing field when displacing (a plain spatter drop
    // is laid down without disturbing what's underneath it).
    get displacement(): Displacement | null {
        return this.displacing ? this : null;
    }

    get deposit(): InkDeposit {
        return {color: this.color, radius: this.radius, center: this.position};
    }

    // Radial spread: a point at distance r from the centre moves out to
    // r' = sqrt(r² + R²), keeping its angle.
    atPoint(point: Vec2): Vec2 {
        const radius2 = Math.pow(this.radius, 2);
        const pointDir = point.sub(this.position);
        const factor = Math.sqrt(1 + (radius2 / Math.pow(pointDir.length(), 2)));

        const newPoint = this.position.add(pointDir.scale(factor));
        return newPoint.sub(point);
    }

    // Inverse of the radial spread: r = sqrt(r'² − R²) along the same angle.
    inverseAtPoint(point: Vec2): Vec2 {
        const radius2 = Math.pow(this.radius, 2);
        const pointDir = point.sub(this.position);
        const rPrime = pointDir.length();
        const r = Math.sqrt(Math.max(0, rPrime * rPrime - radius2));

        const newPoint = this.position.add(pointDir.scale(r / rPrime));
        return newPoint.sub(point);
    }
}
