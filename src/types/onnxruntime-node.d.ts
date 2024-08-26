declare module "onnxruntime-node" {
  export class InferenceSession {
    static create(path: string): Promise<InferenceSession>;
    run(feeds: { [key: string]: Tensor }): Promise<{ [key: string]: Tensor }>;
  }

  export class Tensor {
    constructor(type: string, data: Float32Array, dims: number[]);
    data: Float32Array;
  }
}
