///<reference path="vector.ts"/>
class Mat2x2 {
    readonly m11: number;
    readonly m12: number;
    readonly m21: number;
    readonly m22: number;

    constructor(m11: number, m12: number, m21: number, m22: number) {
        this.m11 = m11;
        this.m12 = m12;
        this.m21 = m21;
        this.m22 = m22;
    }

    static withColumns(first: Vec2, second: Vec2) {
        return new Mat2x2(first.x, second.x, first.y, second.y);
    }

    mult(v: Vec2) {
        return new Vec2(this.m11 * v.x + this.m12 * v.y, this.m21 * v.x + this.m22 * v.y);
    }
}