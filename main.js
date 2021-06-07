const cores = navigator.hardwareConcurrency;
let board, info, history;
let generation = 0;
let bestBrainStats = freshBatch();
let brainStats = [];

let replayGen = 0;
let snake = birth(bestBrainStats[0].brain);
let hash = hashBrain(snake.brain);

const p = n => String(n).padStart(5, " ");

function freshBatch() {
    const rng = new RNG("...");
    return vec(cores).map(() => ({
        brain: mutant(brain(12, 12, 4, 2), () => rng.uniform()),
        ate: 0,
        age: 0,
    }));
}

function handleWorkResult({ data }) {
    brainStats.push(data);
    if (brainStats.length == cores) {
        ++generation;
        bestBrainStats = [...brainStats, ...bestBrainStats]
            .sort(byFitness)
            .slice(0, cores);
        brainStats = [];
        if (!snake) {
            replayGen = generation;
            snake = birth(bestBrainStats.sort(byFitness)[0].brain);
            hash = hashBrain(snake.brain);
            history.innerHTML += `\n${p(hash)} ${p(generation)}`;
        }
        nextWork();
    }
}

function nextWork() {
    for (let i = 0; i < cores; ++i) {
        const worker = new Worker("EvolutionWorker.js");
        worker.addEventListener("message", handleWorkResult);
        worker.postMessage({
            brain: bestBrainStats[i].brain,
            seed: `${generation} ${i}`,
        });
    }
}

function nextFrame() {
    if (!snake) {
        return;
    }
    if (nextState(snake) == "died") {
        history.innerHTML += ` ${p(snake.ate)} ${p(snake.age)}`;
        snake = null;
    } else {
        draw(snake, `generation ${replayGen}`, board, info);
    }
}

function DomLoad() {
    board = document.querySelector("#board").getContext("2d");
    info = document.querySelector("#info").getContext("2d");
    history = document.querySelector("pre");
    setInterval(nextFrame, 20);
    nextWork();
}
