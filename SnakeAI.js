"use strict";
const vec = (n) => [...Array(n)].map(n => 0);
const layer = (prevNeurons, neurons = prevNeurons) => vec(neurons).map(n => ({ bias: 0, weights: vec(prevNeurons) }));
const brain = (inputNeurons, hiddenLayerNeurons, outputNeurons, hiddenLayers) => [
    layer(inputNeurons, hiddenLayerNeurons),
    ...vec(hiddenLayers - 1).map(hl => layer(hiddenLayerNeurons)),
    layer(hiddenLayerNeurons, outputNeurons),
];
const next = (layers, inputs) => layers.reduce((inputs, layer) => layer.map(({ bias, weights }) => Math.tanh(inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias)), inputs);
const mutant = (brain, rn, rate = 0.2) => brain.map(l => l.map(({ bias, weights }) => ({
    bias: rn() < rate ? rn() : bias,
    weights: weights.map(w => (rn() < rate ? rn() * 2 - 1 : w)),
})));
function draw({ body, head, food, ate, age }, message, board) {
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
    board.fillStyle = "#000";
    board.font = ".5px Arial";
    board.fillText(`ate ${ate}, age ${age}, ${message}`, 0.5, 1);
    board.restore();
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
    return next(brain, inputs.map(b => (b ? 1 : 0)));
}
//Modifies the snake parameter with its next state
function nextState(snake) {
    const { head, food, body, rng } = snake;
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
        snake.hunger >= timeout) {
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
    constructor() {
        this.numSnake = 1000;
        this.numTop = Math.ceil(this.numSnake / 10);
        this.numChild = this.numSnake / this.numTop - 1;
        this.rng = new RNG("...");
        this.population = vec(this.numSnake)
            .map(n => mutant(brain(12, 12, 4, 2), () => this.rng.uniform()))
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
            const fit = (s) => s.age + s.ate * timeout;
            this.population = this.population.sort((s0, s1) => fit(s1) - fit(s0));
            for (let i = 0; i < this.numTop; ++i) {
                for (let child = 0; child < this.numChild; ++child) {
                    this.population[this.numTop + i * this.numChild + child].brain = mutant(this.population[i].brain, () => this.rng.uniform());
                }
            }
            for (let i = this.numTop; i < this.numSnake; ++i) {
                this.population[i].age = this.population[i].ate = 0;
            }
        }
        //Reset live snake
        this.liveSnake = birth(this.population[this.snake].brain);
        return this.snake ? "bred" : "dead";
    }
}
//# sourceMappingURL=SnakeAI.js.map