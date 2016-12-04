///<reference path="vector.ts"/>
interface VectorField {
    atPoint(point: Vec2): Vec2
}

class UniformVectorField implements VectorField {
    atPoint(point: Vec2): Vec2 {
        return new Vec2(0, 1);
    }
}


class SinVectorField implements VectorField {
    atPoint(point: Vec2): Vec2 {
        return new Vec2(Math.sin(0.01 * point.x), Math.sin(0.01 * point.x));
    }
}