declare class RNG {
    constructor(seed: string);
    uniform(): number;
    random(a: number, b: number): number;
}

type Batch = BrainStats[];

const fit = (s: BrainStats) => s.ate * timeout + s.age;
const byFitness = (s0: BrainStats, s1: BrainStats) => fit(s1) - fit(s0);

const bestOfBatch = (batch: Batch): BrainStats =>
    batch
        .map(({ brain }) => {
            const snake = birth(brain);
            while (nextState(snake) != "died");
            const { ate, age } = snake;
            return { brain, ate, age };
        })
        .sort(byFitness)[0];

const reproduce = (
    count: number,
    brain: Brain,
    rng: RNG
): BrainStats[] =>
    vec(count).map(child => ({
        brain: mutant(brain, () => rng.uniform()),
        ate: 0,
        age: 0,
    }));
