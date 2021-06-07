let worker, board, info, history, frameTimer;
let replay = { snake: null, generation: null };
const p = n => String(n).padStart(5, " ");

function nextFrame() {
    if (!replay.snake) {
        return;
    }
    const result = nextState(replay.snake);
    draw(replay.snake, `generation ${replay.generation}`, board, info);
    if (result == "died") {
        replay.snake = null;
        worker.postMessage("");
    }
}

const hashBrain = brain =>
    new RNG(JSON.stringify(brain))
        .random(0, Math.pow(16, 4))
        .toString(16)
        .padStart(4, "0");

function handleWorkerMessage({
    data: {
        generation,
        snake: { ate, brain, age },
    },
}) {
    replay.generation = generation;
    replay.snake = birth(brain);
    history.innerHTML += `\n${p(hashBrain(brain))} ${p(replay.generation)} ${p(
        ate
    )} ${p(age)}`;
    clearInterval(frameTimer);
    frameTimer = setInterval(nextFrame, 60 - ate);
}

function DomLoad() {
    board = document.querySelector("#board").getContext("2d");
    info = document.querySelector("#info").getContext("2d");
    history = document.querySelector("pre");
    worker = new Worker("EvolutionWorker.js");
    worker.addEventListener("message", handleWorkerMessage);
    worker.postMessage("");
    frameTimer = setInterval(nextFrame, 20);
}
