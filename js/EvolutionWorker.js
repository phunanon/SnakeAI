importScripts("rng.js", "SnakeAI.js");

const sim = new SnakeEvolution();

function heavyProcessing() {
    let releaseAt = Date.now() + 5_000;
    while (releaseAt > Date.now()) {
        sim.nextAct();
    }
    setTimeout(heavyProcessing, 100);
}

onmessage = function (e) {
    if (e.data !== "giveBest") {
        sim.population[0] = e.data;
    }
    self.postMessage({ snake: sim.population[0], generation: sim.generation });
};

setTimeout(heavyProcessing, 100);