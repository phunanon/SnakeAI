importScripts("rng.js", "SnakeAI.js");

const sim = new SnakeEvolution();
let processing = false;

function heavyProcessing() {
    for (let i = 0; i < 200000; ++i) {
        sim.nextAct();
    }
}

onmessage = function (e) {
    if (e.data !== "giveBest") {
        sim.population[0] = e.data;
    }
    self.postMessage({ snake: sim.population[0], generation: sim.generation });
};

setInterval(heavyProcessing, 100);