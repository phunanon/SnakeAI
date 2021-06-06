type Layer = {
    neurons: { bias: number; weights: number[] }[];
    outputs?: number[];
};
type Brain = { layers: Layer[]; inputs: number[] };

const vec = (n: number) => [...Array(n)].map(n => 0);

const layer = (prevNeurons: number, neurons: number = prevNeurons): Layer => ({
    neurons: vec(neurons).map(n => ({ bias: 0, weights: vec(prevNeurons) })),
});

const brain = (
    inputNeurons: number,
    hiddenLayerNeurons: number,
    outputNeurons: number,
    hiddenLayers: number,
): Brain => ({
    layers: [
        layer(inputNeurons, hiddenLayerNeurons),
        ...vec(hiddenLayers - 1).map(hl => layer(hiddenLayerNeurons)),
        layer(hiddenLayerNeurons, outputNeurons),
    ],
    inputs: vec(inputNeurons),
});

const next = ({ layers, inputs }: Brain): number[] => {
    return layers.reduce((inputs, layer) => {
        layer.outputs = layer.neurons.map(({ bias, weights }) =>
            Math.tanh(inputs.reduce((sum, input, i) => sum + input * weights[i], 0) + bias),
        );
        return layer.outputs;
    }, inputs);
};

const mutant = (brain: Brain, rn: () => number, rate: number = 0.2): Brain => ({
    layers: brain.layers.map(l => ({
        neurons: l.neurons.map(({ bias, weights }) => ({
            bias: rn() < rate ? rn() : bias,
            weights: weights.map(w => (rn() < rate ? rn() * 2 - 1 : w)),
        })),
    })),
    inputs: brain.inputs,
});
