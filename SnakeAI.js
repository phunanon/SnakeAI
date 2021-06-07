"use strict";
const vec = (n) => [...Array(n)].map(n => 0);
const layer = (prevNeurons, neurons = prevNeurons) => ({
    neurons: vec(neurons).map(n => ({ bias: 0, weights: vec(prevNeurons) })),
});
const brain = (inputNeurons, hiddenLayerNeurons, outputNeurons, hiddenLayers) => ({
    layers: [
        layer(inputNeurons, hiddenLayerNeurons),
        ...vec(hiddenLayers - 1).map(hl => layer(hiddenLayerNeurons)),
        layer(hiddenLayerNeurons, outputNeurons),
    ],
    inputs: vec(inputNeurons),
});
const next = ({ layers, inputs }) => {
    return layers.reduce((inputs, layer) => {
        layer.outputs = layer.neurons.map(({ bias, weights }) => Math.tanh(inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias));
        return layer.outputs;
    }, inputs);
};
const mutant = (brain, rn, rate = 0.2) => ({
    layers: brain.layers.map(l => ({
        neurons: l.neurons.map(({ bias, weights }) => ({
            bias: rn() < rate ? rn() : bias,
            weights: weights.map(w => (rn() < rate ? rn() * 2 - 1 : w)),
        })),
    })),
    inputs: brain.inputs,
});
function draw({ brain, body, head, food, ate, age }, message, board, info) {
    const [height, width] = [body.length, body[0].length];
    board.clearRect(0, 0, board.canvas.width, board.canvas.height);
    board.save();
    board.scale(board.canvas.width / width, board.canvas.height / height);
    //Draw Snake body & head
    body.forEach((row, y) => row.forEach((dot, x) => {
        board.fillStyle = `rgb(0, ${(dot / (ate + 2)) * 200}, 0)`;
        dot && board.fillRect(x, y, 1, 1);
    }));
    board.fillStyle = "rgb(0, 200, 0)";
    board.fillRect(head.x, head.y, 1, 1);
    //Draw food
    board.fillStyle = "#d00";
    board.fillRect(food.x, food.y, 1, 1);
    //Draw info
    info.clearRect(0, 0, info.canvas.width, info.canvas.height);
    info.fillStyle = "#000";
    info.font = "14px Arial";
    info.fillText(`ate ${ate}, age ${age}, ${message}`, 12, 24);
    drawBrain(brain, info);
    board.restore();
}
function drawBrain(brain, info) {
    const margin = 1.2;
    info.save();
    info.translate(32, 48);
    info.scale(30, 30);
    info.font = ".75px monospace";
    const matrix = [brain.inputs, ...brain.layers.map(l => l.outputs ?? [])];
    matrix.forEach((l, x) => l.forEach((r, y) => {
        //Biggest
        if (x == l.length - 1 && r == Math.max(...l)) {
            info.fillStyle = "#000";
            info.fillRect(x * margin - 0.1, y * margin - 0.1, margin, margin);
        }
        //Output
        let R = r < 0 ? r * -255 : 0, G = r > 0 ? r * 255 : 0;
        info.fillStyle = `rgb(${255 - G}, ${255 - R}, ${255 - R - G})`;
        info.fillRect(x * margin, y * margin, 1, 1);
        //Show cardinals for first and last layers
        if (x != 0 && x != l.length - 1) {
            return;
        }
        info.fillStyle = "#000";
        info.fillText("NESWNESWNESW"[y], x * margin + 0.25, y * margin + 0.75);
    }));
    info.restore();
}
const hashBrain = (brain) => new RNG(JSON.stringify(brain))
    .random(0, Math.pow(16, 4))
    .toString(16)
    .padStart(4, "0");
const w = 16, h = 16, timeout = (w + h) * 2;
const birth = (brain) => ({
    brain,
    head: { x: w / 2, y: h / 2 },
    food: { x: Math.floor(w / 3), y: Math.floor(h / 3) },
    body: vec(h).map(y => vec(w)),
    ate: 0,
    age: 0,
    hunger: 0,
    rng: new RNG("."),
});
function think({ brain, head, food, body }) {
    const noN = !head.y, noE = head.x == w - 1, noS = head.y == h - 1, noW = !head.x;
    const inputs = [
        ...[noN, noE, noS, noW],
        head.x == food.x && head.y > food.y,
        head.y == food.y && head.x < food.x,
        head.x == food.x && head.y < food.y,
        head.y == food.y && head.x > food.x,
        !noN && body[head.y - 1][head.x],
        !noE && body[head.y][head.x + 1],
        !noS && body[head.y + 1][head.x],
        !noW && body[head.y][head.x - 1], //Body West
    ];
    brain.inputs = inputs.map(b => (b ? 1 : 0));
    return next(brain);
}
//Modifies the snake parameter with its next state
function nextState(snake) {
    const { head, food, body, rng, ate } = snake;
    const [N, E, S, W] = think(snake);
    const most = Math.max(N, E, S, W);
    head.y += most == S ? 1 : most == N ? -1 : 0;
    head.x += most == N || most == S ? 0 : most == E ? 1 : -1;
    //If snake died
    if (head.x < 0 ||
        head.x == body[0].length ||
        head.y < 0 ||
        head.y == body.length ||
        body[head.y][head.x] ||
        snake.hunger >= timeout * (ate / 10 + 1)) {
        return "died";
    }
    //If snake ate
    const didEat = head.x == food.x && head.y == food.y;
    if (didEat) {
        ++snake.ate;
        snake.hunger = 0;
        food.x = Math.floor(rng.uniform() * w);
        food.y = Math.floor(rng.uniform() * h);
    }
    ++snake.age;
    ++snake.hunger;
    for (let y = 0; y < body.length; ++y) {
        for (let x = 0; x < body[y].length; ++x) {
            body[y][x] && --body[y][x];
        }
    }
    body[head.y][head.x] = snake.ate + 2;
    return didEat ? "ate" : "aged";
}
const fit = (s) => s.ate * timeout + s.age;
const byFitness = (s0, s1) => fit(s1) - fit(s0);
const bestOfBatch = (batch) => batch
    .map(({ brain }) => {
    const snake = birth(brain);
    while (nextState(snake) != "died")
        ;
    const { ate, age } = snake;
    return { brain, ate, age };
})
    .sort(byFitness)[0];
const reproduce = (count, brain, rng) => vec(count).map(child => ({
    brain: mutant(brain, () => rng.uniform()),
    ate: 0,
    age: 0,
}));
//# sourceMappingURL=SnakeAI.js.map