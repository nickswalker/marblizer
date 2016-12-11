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