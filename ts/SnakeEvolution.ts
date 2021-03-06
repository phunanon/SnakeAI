declare class RNG {
    constructor(seed: string);
    uniform(): number;
}

class SnakeEvolution {
    numSnake: number = 50;
    numTop: number = Math.ceil(this.numSnake / 10);
    numChild: number = this.numSnake / this.numTop - 1;
    rng: RNG;
    population: BrainStats[];
    snake: number;
    generation: number;
    liveSnake: LiveSnake;

    constructor() {
        this.rng = new RNG("...");
        this.population = vec(this.numSnake)
            .map(n => mutant(brain(12, 12, 4, 2), () => this.rng.uniform()))
            .map(brain => ({ brain, ate: 0, age: 0 }));
        this.snake = 0;
        this.generation = 0;
        this.liveSnake = birth(this.population[0].brain);
    }

    nextAct(): "alive" | "dead" | "bred" {
        const result = nextState(this.liveSnake);
        if (result != "died") {
            return "alive";
        }
        //Save snake stats
        const { brain, ate, age } = this.liveSnake;
        this.population[this.snake] = { brain, ate, age };

        //If we've reached the end of the generation
        if (++this.snake == this.numSnake) {
            this.snake = this.numTop;
            ++this.generation;
            //Breed winners
            const fit = (s: BrainStats) => s.ate * timeout + s.age;
            const top = this.population
                .sort((s0, s1) => fit(s1) - fit(s0))
                .slice(0, this.numTop);
            const rng = () => this.rng.uniform();
            const offspring = top.flatMap(({ brain }) =>
                vec(this.numChild).map(() => mutant(brain, rng))
            );
            const brain2stats = (brain: Brain) => ({ brain, ate: 0, age: 0 });
            this.population = [...top, ...offspring.map(brain2stats)];
        }

        //Reset live snake
        this.liveSnake = birth(this.population[this.snake].brain);

        return this.snake ? "bred" : "dead";
    }
}
