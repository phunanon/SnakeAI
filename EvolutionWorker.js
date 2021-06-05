importScripts("rng.js", "SnakeAI.js");

const sim = new SnakeEvolution();
let processing = false;

function heavyProcessing() {
    for (let i = 0; i < 100000; ++i) {
        sim.nextAct();
    }
}

onmessage = function (e) {
    self.postMessage({ brain: sim.population[0].brain, generation: sim.generation });
};

setInterval(heavyProcessing, 100);