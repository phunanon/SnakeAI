import { RNG } from "./rng.js";
import { brain, mutant } from "./Brain.js";
import { birth, nextState, timeout, } from "./Snake.js";
export class SnakeEvolution {
    numSnake = 50;
    numTop = Math.ceil(this.numSnake / 10);
    numChild = this.numSnake / this.numTop - 1;
    rng;
    population;
    snake;
    generation;
    liveSnake;
    constructor() {
        this.rng = new RNG("...");
        this.population = Array.from({ length: this.numSnake }, () => mutant(brain(12, 8, 4, 2), () => this.rng.uniform())).map(brain => ({ brain, ate: 0, age: 0 }));
        this.snake = 0;
        this.generation = 0;
        this.liveSnake = birth(this.population[0].brain);
    }
    nextAct() {
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
            const fit = (s) => s.ate * timeout + s.age;
            const top = this.population
                .sort((s0, s1) => fit(s1) - fit(s0))
                .slice(0, this.numTop);
            const rng = () => this.rng.uniform();
            const offspring = top.flatMap(({ brain }) => Array.from({ length: this.numChild }, () => mutant(brain, rng)));
            const brain2stats = (brain) => ({ brain, ate: 0, age: 0 });
            this.population = [...top, ...offspring.map(brain2stats)];
        }
        //Reset live snake
        this.liveSnake = birth(this.population[this.snake].brain);
        return this.snake ? "bred" : "dead";
    }
}
//# sourceMappingURL=SnakeEvolution.js.map