importScripts("rng.js", "SnakeAI.js");

onmessage = function ({data: {brain, seed}}) {
    const rng = new RNG(seed);
    self.postMessage(bestOfBatch(reproduce(20000, brain, rng)));
    self.close();
};