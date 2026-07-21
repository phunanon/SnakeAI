import { draw } from './Draw.js';
import { RNG } from './rng.js';
import { birth, nextState } from './Snake.js';
const globalWindow = window;
let worker;
let board;
let info;
let history;
let replay = {
    snake: null,
    generation: null,
};
const p = (n) => String(n).padStart(5, ' ');
function nextFrame(ate, age) {
    if (!replay.snake) {
        return;
    }
    const result = nextState(replay.snake);
    draw(replay.snake, `generation ${replay.generation}`, board, info);
    if (result === 'died') {
        replay.snake = null;
        worker.postMessage('giveBest');
    }
    const lastSecond = replay.snake && replay.snake.age + 10 >= age;
    window.setTimeout(() => nextFrame(ate, age), lastSecond ? 100 : Math.min(50 - ate, 1000 - age));
}
const hashBrain = (brain) => new RNG(JSON.stringify(brain))
    .random(0, 16 ** 4)
    .toString(16)
    .padStart(4, '0');
function handleWorkerMessage({ data: { generation, snake: { ate, brain, age }, }, }) {
    replay.generation = generation;
    replay.snake = birth(brain);
    history.innerHTML += `\n${p(hashBrain(brain))} ${p(Number(replay.generation))} ${p(ate)} ${p(age)}`;
    nextFrame(ate, age);
}
export function DomLoad() {
    board = document
        .querySelector('#board')
        .getContext('2d');
    info = document.querySelector('#info').getContext('2d');
    history = document.querySelector('pre');
    worker = new Worker('js/EvolutionWorker.js', { type: 'module' });
    worker.addEventListener('message', handleWorkerMessage);
    worker.postMessage('giveBest');
}
globalWindow.DomLoad = DomLoad;
//# sourceMappingURL=main.js.map