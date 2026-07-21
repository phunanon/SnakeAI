import type { Brain } from './Brain.js';
import { draw } from './Draw.js';
import { RNG } from './rng.js';
import { birth, nextState, type LiveSnake } from './Snake.js';

type WindowWithHooks = Window & {
  DomLoad?: () => void;
};

const globalWindow = window as WindowWithHooks;

let worker: Worker;
let board: CanvasRenderingContext2D;
let info: CanvasRenderingContext2D;
let history: HTMLPreElement;
let replay: { snake: LiveSnake | null; generation: number | null } = {
  snake: null,
  generation: null,
};

const p = (n: number | string) => String(n).padStart(5, ' ');

function nextFrame(ate: number, age: number) {
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
  window.setTimeout(
    () => nextFrame(ate, age),
    lastSecond ? 100 : Math.min(50 - ate, 1000 - age),
  );
}

const hashBrain = (brain: Brain) =>
  new RNG(JSON.stringify(brain))
    .random(0, 16 ** 4)
    .toString(16)
    .padStart(4, '0');

function handleWorkerMessage({
  data: {
    generation,
    snake: { ate, brain, age },
  },
}: MessageEvent<{
  generation: number;
  snake: { ate: number; brain: Brain; age: number };
}>) {
  replay.generation = generation;
  replay.snake = birth(brain);
  history.innerHTML += `\n${p(hashBrain(brain))} ${p(Number(replay.generation))} ${p(ate)} ${p(age)}`;
  nextFrame(ate, age);
}

export function DomLoad() {
  board = document
    .querySelector<HTMLCanvasElement>('#board')!
    .getContext('2d')!;
  info = document.querySelector<HTMLCanvasElement>('#info')!.getContext('2d')!;
  history = document.querySelector('pre')!;
  worker = new Worker('js/EvolutionWorker.js', { type: 'module' });
  worker.addEventListener('message', handleWorkerMessage);
  worker.postMessage('giveBest');
}

globalWindow.DomLoad = DomLoad;
