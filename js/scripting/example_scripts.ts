const tutorialProgram = `\
let operations = [];
const black = new Color(0,0,0);
for (let i = 0; i < 100; i++) {
    const origin = new Vec2(i * 20, 10);
    const operation = new InkDropOperation(origin, 5, black);
    operations.push(operation);
}
return operations;\
`;

const concentricCircles = `\
let operations = [];
const colorSet = colorSets[0];
const center = new Vec2(this.canvasWidth, this.canvasHeight).scale(0.5);
for (let i = 0; i < 100; i++) {
  	const color = colorSet[i % colorSet.length];
    const operation = new InkDropOperation(center, 200 - 2 * i, color);
    operations.push(operation);
}
return operations;\
`;