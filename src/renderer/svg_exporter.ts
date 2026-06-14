import Vec2 from "../models/vector.js";
import Operation from "../operations/color_operations.js";
import {Drop, InteractiveCurveRenderer} from "./curve_renderer.js";

function escapeAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function pathForDrop(drop: Drop): string {
    const first = drop.points[0];
    const commands = [`M ${first.x} ${first.y}`];
    for (let i = 1; i < drop.points.length; i++) {
        const point = drop.points[i];
        commands.push(`L ${point.x} ${point.y}`);
    }
    commands.push("Z");
    return commands.join(" ");
}

function downloadText(filename: string, text: string, mimeType: string) {
    const blob = new Blob([text], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportSVG(operations: Operation[], size: Vec2): string {
    const container = document.createElement("div");
    const renderer = new InteractiveCurveRenderer(container, false);
    renderer.setSize(size.x, size.y);
    renderer.applyOperations(operations);

    const elements = [
        `<rect width="100%" height="100%" fill="${escapeAttribute(renderer.baseColor.toHexString())}"/>`,
        ...renderer.drops.map((drop) => {
            const path = escapeAttribute(pathForDrop(drop));
            const fill = escapeAttribute(drop.color.toHexString());
            return `<path d="${path}" fill="${fill}"/>`;
        }),
    ];

    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size.x}" height="${size.y}" viewBox="0 0 ${size.x} ${size.y}">`,
        ...elements,
        `</svg>`,
    ].join("\n");
}

export function downloadSVG(operations: Operation[], size: Vec2) {
    downloadText("ink-marbling-image.svg", exportSVG(operations, size), "image/svg+xml;charset=utf-8");
}
