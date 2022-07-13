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
function draw({ brain, body, head, food, ate, age }, title, board, info) {
    const [height, width] = [body.length, body[0].length];
    board.clearRect(0, 0, board.canvas.width, board.canvas.height);
    board.save();
    board.scale(board.canvas.width / width, board.canvas.height / height);
    //Draw Snake body & head
    body.forEach((row, y) => row.forEach((dot, x) => {
        board.fillStyle = `rgb(0, ${(dot / (ate + 2)) * 200 + 55}, 0)`;
        dot && board.fillRect(x, y, 1, 1);
    }));
    board.fillStyle = "#0f0";
    board.fillRect(head.x, head.y, 1, 1);
    //Draw food
    board.fillStyle = "#d00";
    board.fillRect(food.x, food.y, 1, 1);
    //Draw info
    info.clearRect(0, 0, info.canvas.width, info.canvas.height);
    info.fillStyle = "#fff";
    info.font = "14px Arial";
    info.fillText(`${title}`, 12, 20);
    info.fillText(`ate ${ate}, age ${age}`, 12, 38);
    drawBrain(brain, info);
    board.restore();
}
function drawBrain(brain, info) {
    const px = 1.2;
    info.save();
    info.translate(32, 48);
    info.scale(30, 30);
    info.font = ".75px monospace";
    const matrix = [brain.inputs, ...brain.layers.map(l => l.outputs ?? [])];
    matrix.forEach((l, x) => l.forEach((r, y) => {
        //Biggest
        if (x == matrix.length - 1 && r == Math.max(...l)) {
            info.fillStyle = "#fff";
            info.fillRect(x * px - 0.1, y * px - 0.1, px, px);
        }
        //Output
        let R = r < 0 ? r * -255 : 0, G = r > 0 ? r * 255 : 0;
        info.fillStyle = `rgb(${R}, ${G}, ${0})`;
        info.fillRect(x * px, y * px, 1, 1);
        //Show cardinals for first and last layers
        if (x != 0 && x != matrix.length - 1) {
            return;
        }
        info.fillStyle = "#000";
        info.fillText("NESW"[y % 4], x * px + 0.25, y * px + 0.75);
    }));
    info.restore();
}
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
        snake.hunger >= w * h) {
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
class SnakeEvolution {
    numSnake = 50;
    numTop = Math.ceil(this.numSnake / 10);
    numChild = this.numSnake / this.numTop - 1;
    rng;
    population;
    snake;
    generation;
    liveSnake;
    constructor() {
        this.rng = new RNG("...");
        this.population = vec(this.numSnake)
            .map(n => mutant(brain(12, 4, 4, 1), () => this.rng.uniform()))
            .map(brain => ({ brain, ate: 0, age: 0 }));
        this.snake = 0;
        this.generation = 0;
        this.liveSnake = birth(this.population[0].brain);
    }
    nextAct() {
        const result = nextState(this.liveSnake);
        if (result != "died") {
            return "alive";
        }
        //Save snake stats
        const { brain, ate, age } = this.liveSnake;
        this.population[this.snake] = { brain, ate, age };
        //If we've reached the end of the generation
        if (++this.snake == this.numSnake) {
            this.snake = this.numTop;
            ++this.generation;
            //Breed winners
            const fit = (s0, s1) => s1.ate -
                s0.ate +
                (s0.age > s1.age ? -0.5 : s0.age < s1.age ? 0.5 : 0);
            const top = this.population.sort(fit).slice(0, this.numTop);
            const rng = () => this.rng.uniform();
            const offspring = top.flatMap(({ brain }) => vec(this.numChild).map(() => mutant(brain, rng, rng() / 20)));
            const brain2stats = (brain) => ({ brain, ate: 0, age: 0 });
            this.population = [...top, ...offspring.map(brain2stats)];
        }
        //Reset live snake
        this.liveSnake = birth(this.population[this.snake].brain);
        return this.snake ? "bred" : "dead";
    }
}
//# sourceMappingURL=SnakeAI.js.map