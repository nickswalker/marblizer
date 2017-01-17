const tutorialProgram = `\
let operations = [];
const colorSet = colorSets[0];
const center = new Vec2(this.canvasWidth, this.canvasHeight).scale(0.5);
for (let i = 0; i < 21; i++) {
  	const color = colorSet[i % colorSet.length];
    const operation = new InkDropOperation(center, 200 - 2 * i, color);
    operations.push(operation);
}

const halfWidth = this.canvasWidth / 2;
const halfHeight = this.canvasHeight / 2;

const midLeft = new Vec2(0, this.canvasHeight / 2);
const midRight = new Vec2(this.canvasWidth, this.canvasHeight / 2);

const midUpper = new Vec2(this.canvasWidth / 2, 0);
const midLower = new Vec2(this.canvasWidth / 2, this.canvasHeight);

for (let i = 0; i <= 3; i +=1) {
 let operation = new CircularLineTine(midLeft, i * halfWidth / 3, 1, 0);
  operations.push(operation);
  operation = new CircularLineTine(midRight, i * halfWidth / 3, 1, 0);
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