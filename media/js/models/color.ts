class Color {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;

    constructor(r: number, g: number, b: number, a:number=1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toRGBString() {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }

    toRGBAString() {
        return "rgba(" + this.r + ", " + this.g + ", " + this.b + "," + this.a + ")";
    }
    toHexString() {
        function componentToHex(c) {
            let hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        return "#" + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b);
    }

    withAlpha(alpha: number) {
        return new Color(this.r, this.g, this.b, alpha);
    }

    toHexStringWithAlpha() {
        function componentToHex(c) {
            let hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        return "#" + componentToHex(this.r) + componentToHex(this.g) + componentToHex(this.b) + componentToHex(this.a);
    }

    static withRGB(hex: string) {
        const result = /^rgb?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1]);
            const g = parseInt(result[2]);
            const b = parseInt(result[3]);

            return new Color(r,g,b);
        }
        return null;

    }

    static withHex(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);

            return new Color(r,g,b);
        }
        return null;

    }
}

const black = new Color(0, 0, 0);
const white = new Color(255, 255, 255);
const red = new Color(255, 0, 0);
const green = new Color(0, 255, 0);
const blue = new Color(0, 0, 255);

const colorSets = [
    [Color.withHex("27372d"), Color.withHex("a98918"), Color.withHex("891920"), Color.withHex("d0b9a0"), Color.withHex("2b231b")],
    [Color.withHex("605B73"), Color.withHex("414257"), Color.withHex("4E7F9E"), Color.withHex("AFBDD9"), Color.withHex("5A87A0")],
    [Color.withHex("C5BDA6"), Color.withHex("CF5725"), Color.withHex("1B1C21"), Color.withHex("849C86"), Color.withHex("BDA99E")],
    [Color.withHex("FFFFFF"), Color.withHex("00FFFF"), Color.withHex("FF00FF"), Color.withHex("FFFF00"), Color.withHex("000000")]
];

