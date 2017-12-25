import Mat2x2 from "./matrix.js";

export default class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static zero() {
        return new Vec2(0, 0);
    }

    sub(other: Vec2): Vec2 {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    add(other: Vec2) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }

    dot(other: Vec2) {
        return this.x * other.x + this.y * other.y;
    }

    copy() {
        return new Vec2(this.x, this.y);
    }

    // Accumulate
    acc(other: Vec2) {
        this.x += other.x;
        this.y += other.y;
    }

    scale(factor: number) {
        return new Vec2(this.x * factor, this.y * factor);
    }

    norm(): Vec2 {
        const l = this.length();
        return new Vec2(this.x / l, this.y / l);
    }


    perp() {
        return new Vec2(-1 * this.y, this.x);
    }

    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    mult(mat: Mat2x2) {
        return new Vec2(this.x * mat.m11 + this.y * mat.m21, this.x * mat.m12 + this.y * mat.m22);
    }

    get(i: number): number {
        switch (i) {
            case 0:
                return this.x;
            case 1:
                return this.y;
        }
        console.assert(false, "Invalid vector index")
    }

    eq(other: Vec2): boolean {
        return this.x == other.x && this.y == other.y;
    }
}

export function vecMax(first: Vec2, second: Vec2) {
    return new Vec2(Math.max(first.x, second.x), Math.max(first.y, second.y));
}

export function vecMin(first: Vec2, second: Vec2) {
    return new Vec2(Math.min(first.x, second.x), Math.min(first.y, second.y));
}