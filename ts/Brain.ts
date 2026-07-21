export type Neuron = { bias: number; weights: number[] };
export type Layer = {
  neurons: Neuron[];
  outputs: number[];
};
export type Brain = { layers: Layer[]; inputs: number[] };

export const vec = (n: number): number[] => Array.from({ length: n }, () => 0);

export const layer = (
  prevNeurons: number,
  neurons: number = prevNeurons,
): Layer => ({
  neurons: Array.from({ length: neurons }, () => ({
    bias: 0,
    weights: vec(prevNeurons),
  })),
  outputs: new Array<number>(neurons),
});

export const brain = (
  inputNeurons: number,
  hiddenLayerNeurons: number,
  outputNeurons: number,
  hiddenLayers: number,
): Brain =>
  ({
    layers: [
      layer(inputNeurons, hiddenLayerNeurons),
      ...Array.from({ length: Math.max(hiddenLayers - 1, 0) }, () =>
        layer(hiddenLayerNeurons),
      ),
      layer(hiddenLayerNeurons, outputNeurons),
    ],
    inputs: vec(inputNeurons),
  }) satisfies Brain;

export const next = ({ layers, inputs }: Brain): number[] => {
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

export const mutant = (
  brain: Brain,
  rn: () => number,
  rate: number = 0.2,
): Brain => ({
  layers: brain.layers.map(layer => {
    const neurons = Array.from(
      { length: layer.neurons.length },
      (_, neuronIndex) => {
        const { bias, weights } = layer.neurons[neuronIndex];
        const nextWeights = Array.from(
          { length: weights.length },
          (_, weightIndex) =>
            rn() < rate ? rn() * 2 - 1 : weights[weightIndex],
        );

        return {
          bias: rn() < rate ? rn() : bias,
          weights: nextWeights,
        };
      },
    );

    return { neurons, outputs: new Array<number>(neurons.length) };
  }),
  inputs: brain.inputs,
});
