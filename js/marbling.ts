/// <reference path=".d.ts"/>
/// <reference path="ui.ts"/>
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
    toFillStyle() {
        return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }
}

class Drop {
    path: Path2D;
    readonly color: Color;
    constructor(color: Color, centerX: number, centerY: number) {
        this.color = color;
        this.path = new Path2D();
        this.path.arc(centerX,centerY,10,0,2 * Math.PI);
        this.path.closePath();
    }
}


class MarblingRenderer {
    domElement: HTMLCanvasElement;
    drops: Drop[] = [];
    context: CanvasRenderingContext2D;
    baseColor: Color = new Color(199,49,5);
    currentTool: Tool = Tool.Tine;
    currentColor: Color = new Color(255,255,255);
    constructor() {
        this.domElement = document.createElement("canvas");
        this.domElement.onmousedown = this.mouseDown.bind(this);
        this.domElement.onmouseup = this.mouseUp.bind(this);
        this.context = this.domElement.getContext("2d");
        window.requestAnimationFrame(this.draw.bind(this));
    }
    setSize(width: number, height: number) {
        this.domElement.height = height;
        this.domElement.width = width;
    }

    draw() {
        this.context.fillStyle = this.baseColor.toFillStyle();
        this.context.fillRect(0,0,this.domElement.width, this.domElement.height);
        for (let i = 0; i < this.drops.length; i ++) {
            const drop = this.drops[i];
            this.context.fillStyle = drop.color.toFillStyle();
            this.context.fill(drop.path);
        }
        window.requestAnimationFrame(this.draw.bind(this));
    }
    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.currentTool) {
            case Tool.Drop:
                break
        }
    }
    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        switch (this.currentTool) {
            case Tool.Drop:
                let newDrop = new Drop(this.currentColor,x, y);
                this.drops.push(newDrop);
                break;
        }
    }

    toolDidChange(tool: Tool) {
        this.currentTool = tool;
    }
    colorDidChange(color: Color) {
        this.currentColor = color;
    }
}

