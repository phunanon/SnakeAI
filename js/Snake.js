import { RNG } from './rng.js';
import { next, vec } from './Brain.js';
export const w = 16;
export const h = 16;
export const timeout = w * h;
export const birth = (brain) => ({
    brain,
    head: { x: w / 2, y: h / 2 },
    food: { x: Math.floor(w / 3), y: Math.floor(h / 3) },
    body: vec(h).map(() => vec(w)),
    ate: 0,
    age: 0,
    hunger: 0,
    rng: new RNG('.'),
});
export function think(snake) {
    const { brain, head, food, body } = snake;
    const noN = !head.y, noE = head.x == w - 1, noS = head.y == h - 1, noW = !head.x;
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
    brain.inputs = inputs.map(b => (b ? 1 : 0));
    return next(brain);
}
//Modifies the snake parameter with its next state
export function nextState(snake) {
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
        snake.hunger >= timeout) {
        return 'died';
    }
    //If snake ate
    const didEat = head.x == food.x && head.y == food.y;
    if (didEat) {
        ++snake.ate;
        snake.hunger = 0;
        do {
            food.x = Math.floor(rng.uniform() * w);
            food.y = Math.floor(rng.uniform() * h);
        } while (body[food.y][food.x] || (food.x == head.x && food.y == head.y));
    }
    ++snake.age;
    ++snake.hunger;
    for (let y = 0; y < body.length; ++y) {
        for (let x = 0; x < body[y].length; ++x) {
            body[y][x] && --body[y][x];
        }
    }
    body[head.y][head.x] = snake.ate + 2;
    return didEat ? 'ate' : 'aged';
}
//# sourceMappingURL=Snake.js.map