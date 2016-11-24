class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    scale(factor: number) {
        this.x *= factor;
        this.y *= factor;
        // For chainability
        return this;
    }

    sub(other: Vec2) {
        return new Vec2(this.x - other.x, this.y - other.y);
    }

    add(other: Vec2) {
        return new Vec2(this.x + other.x, this.y + other.y);
    }
    // Accumulate
    acc(other: Vec2) {
        this.x += other.x;
        this.y += other.y;
    }

    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}