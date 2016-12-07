class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    sub(other: Vec2) {
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
        this.x *= factor;
        this.y *= factor;
        // For chainability
        return this;
    }

    norm() {
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
        return new Vec2(this.x * mat.a + this.y + mat.c, this.x * mat.b + this.y * mat.d);
    }
}

function vecMax(first: Vec2, second: Vec2) {
    return new Vec2(Math.max(first.x, second.x), Math.max(first.y, second.y));
}

function vecMin(first: Vec2, second: Vec2) {
    return new Vec2(Math.min(first.x, second.x), Math.min(first.y, second.y));
}