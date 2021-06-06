type Layer = { bias: number; weights: number[] }[];
type Brain = Layer[];

const vec = (n: number) => [...Array(n)].map(n => 0);

const layer = (prevNeurons: number, neurons: number = prevNeurons): Layer =>
    vec(neurons).map(n => ({ bias: 0, weights: vec(prevNeurons) }));

const brain = (
    inputNeurons: number,
    hiddenLayerNeurons: number,
    outputNeurons: number,
    hiddenLayers: number,
): Brain => [
    layer(inputNeurons, hiddenLayerNeurons),
    ...vec(hiddenLayers - 1).map(hl => layer(hiddenLayerNeurons)),
    layer(hiddenLayerNeurons, outputNeurons),
];

const next = (layers: Brain, inputs: number[]): number[] =>
    layers.reduce(
        (inputs, layer) =>
            layer.map(({ bias, weights }) =>
                Math.tanh(inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias),
            ),
        inputs,
    );

const mutant = (brain: Brain, rn: () => number, rate: number = 0.2): Brain =>
    brain.map(l =>
        l.map(({ bias, weights }) => ({
            bias: rn() < rate ? rn() : bias,
            weights: weights.map(w => (rn() < rate ? rn() * 2 - 1 : w)),
        })),
    );
