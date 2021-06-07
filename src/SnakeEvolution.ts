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
            this.population = this.population.sort((s0, s1) => fit(s1) - fit(s0));
            for (let i = 0; i < this.numTop; ++i) {
                for (let child = 0; child < this.numChild; ++child) {
                    this.population[this.numTop + i * this.numChild + child].brain = mutant(
                        this.population[i].brain,
                        () => this.rng.uniform(),
                    );
                }
            }
            for (let i = this.numTop; i < this.numSnake; ++i)  {
                this.population[i].age = this.population[i].ate = 0;
            }
        }

        //Reset live snake
        this.liveSnake = birth(this.population[this.snake].brain);

        return this.snake ? "bred" : "dead";
    }
}
