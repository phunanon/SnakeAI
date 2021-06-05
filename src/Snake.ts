const w = 16,
    h = 16,
    timeout = (w + h) * 2;

type BrainStats = { brain: Brain; ate: number; age: number };
type LiveSnake = BrainStats & {
    head: { x: number; y: number };
    food: { x: number; y: number };
    body: number[][];
    rng: RNG;
    hunger: number;
};

const birth: (brain: Brain) => LiveSnake = (brain: Brain) => ({
    brain,
    head: { x: w / 2, y: h / 2 },
    food: { x: Math.floor(w / 3), y: Math.floor(h / 3) },
    body: vec(h).map(y => vec(w)),
    ate: 0,
    age: 0,
    hunger: 0,
    rng: new RNG("."),
});

function think({ brain, head, food, body }: LiveSnake): number[] {
    const noN = !head.y,
        noE = head.x == w - 1,
        noS = head.y == h - 1,
        noW = !head.x;
    const inputs = [
        ...[noN, noE, noS, noW],
        head.x == food.x && head.y > food.y, //Food North
        head.y == food.y && head.x < food.x, //Food East
        head.x == food.x && head.y < food.y, //Food South
        head.y == food.y && head.x > food.x, //Food West
        !noN && body[head.y - 1][head.x], //Body North
        !noE && body[head.y][head.x + 1], //Body East
        !noS && body[head.y + 1][head.x], //Body South
        !noW && body[head.y][head.x - 1], //Body West
    ];
    return next(
        brain,
        inputs.map(b => (b ? 1 : 0)),
    );
}

//Modifies the snake parameter with its next state
function nextState(snake: LiveSnake): "aged" | "ate" | "died" {
    const { head, food, body, rng } = snake;
    const [N, E, S, W] = think(snake);
    const most = Math.max(N, E, S, W);
    head.y += most == S ? 1 : most == N ? -1 : 0;
    head.x += most == N || most == S ? 0 : most == E ? 1 : -1;

    //If snake died
    if (
        head.x < 0 ||
        head.x == body[0].length ||
        head.y < 0 ||
        head.y == body.length ||
        body[head.y][head.x] ||
        snake.hunger >= timeout
    ) {
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
