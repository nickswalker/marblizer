import Vec2 from "../models/vector.js";

export default class UserProgram {
    private executable: Function;

    constructor(string: string,) {

        this.executable = new Function(string);
    }

    static fromBase64(binary: string): UserProgram {
        return new UserProgram(atob(binary));
    }

    asBase64String(): string {
        return btoa(this.executable.toString());
    }

    execute(canvasSize: Vec2) {
        const scriptData = {canvasWidth: canvasSize.x, canvasHeight: canvasSize.y};
        return this.executable.bind(scriptData)();
    }

}