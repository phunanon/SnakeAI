export const vec = (n) => Array.from({ length: n }, () => 0);
export const layer = (prevNeurons, neurons = prevNeurons) => ({
    neurons: Array.from({ length: neurons }, () => ({
        bias: 0,
        weights: vec(prevNeurons),
    })),
    outputs: new Array(neurons),
});
export const brain = (inputNeurons, hiddenLayerNeurons, outputNeurons, hiddenLayers) => ({
    layers: [
        layer(inputNeurons, hiddenLayerNeurons),
        ...Array.from({ length: Math.max(hiddenLayers - 1, 0) }, () => layer(hiddenLayerNeurons)),
        layer(hiddenLayerNeurons, outputNeurons),
    ],
    inputs: vec(inputNeurons),
});
export const next = ({ layers, inputs }) => {
    let currentInputs = inputs;
    for (const layer of layers) {
        const { neurons, outputs } = layer;
        for (let neuronIndex = 0; neuronIndex < neurons.length; ++neuronIndex) {
            const { bias, weights } = neurons[neuronIndex];
            let sum = bias;
            for (let weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
                sum += currentInputs[weightIndex] * weights[weightIndex];
            }
            outputs[neuronIndex] = Math.tanh(sum);
        }
        currentInputs = outputs;
    }
    return currentInputs;
};
export const mutant = (brain, rn, rate = 0.2) => ({
    layers: brain.layers.map(layer => {
        const neurons = Array.from({ length: layer.neurons.length }, (_, neuronIndex) => {
            const { bias, weights } = layer.neurons[neuronIndex];
            const nextWeights = Array.from({ length: weights.length }, (_, weightIndex) => rn() < rate ? rn() * 2 - 1 : weights[weightIndex]);
            return {
                bias: rn() < rate ? rn() : bias,
                weights: nextWeights,
            };
        });
        return { neurons, outputs: new Array(neurons.length) };
    }),
    inputs: brain.inputs,
});
//# sourceMappingURL=Brain.js.map