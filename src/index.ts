///<reference path=".d.ts"/>
import Vec2 from "./models/vector.js";
import {getParameterByName} from "./parse_query_string.js";
import UserProgram from "./scripting/user_program.js";
import {colorSets} from "./models/color.js";
import {InteractiveCurveRenderer} from "./renderer/curve_renderer.js";
import MarblingUI from "./ui/ui.js";

let renderer = null;
addEventListener('DOMContentLoaded', function () {
    let marblingWorkspace = document.getElementById("workspace");
    let toolsPane = document.getElementById("tools");
    let optionsPane = document.getElementById("options");
    let colorsPane = document.getElementById("colors");
    let operationsInput = document.getElementById("operations-input");
    let ui = new MarblingUI(marblingWorkspace, toolsPane, optionsPane, colorsPane, operationsInput);
    renderer = new InteractiveCurveRenderer(marblingWorkspace);
    ui.delegate = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    ui.size = new Vec2(window.innerWidth, window.innerHeight);

    window.onresize = function (event) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        ui.size = new Vec2(window.innerWidth, window.innerHeight);
    };

    const parameter = getParameterByName("p");
    if (parameter != null && confirm("Execute passed in program?")) {
        const decompressed = LZString.decompressFromEncodedURIComponent(parameter);
        const program = new UserProgram(decompressed);
        renderer.applyOperations(program.execute(new Vec2(window.innerWidth, window.innerHeight)));
    }

    const palette = [];
    for (let i = 0; i < colorSets.length; i++) {
        palette.push([]);
        for (let j = 0; j < colorSets[0].length; j++) {
            palette[i].push(colorSets[i][j].toHexString());
        }
    }
    $("input[type='color'].foreground").spectrum({
        showPalette: true,
        preferredFormat: "hex",
        showSelectionPalette: true,
        maxSelectionSize: 5,
        palette: palette,
        replacerClassName: "foreground-spectrum"
    });
    $("input[type='color'].background").spectrum({
        showPalette: true,
        preferredFormat: "hex",
        showSelectionPalette: true,
        maxSelectionSize: 5,
        palette: palette,
        replacerClassName: "background-spectrum"
    });

    const event = new CustomEvent("colorPickersInstalled");
    document.dispatchEvent(event);

});