import * as ort from "onnxruntime-web";

// Add this configuration
ort.env.wasm.wasmPaths = {
  "ort-wasm.wasm": "/ort-wasm.wasm",
  "ort-wasm-simd.wasm": "/ort-wasm-simd.wasm",
  "ort-wasm-threaded.wasm": "/ort-wasm-threaded.wasm",
  "ort-wasm-simd-threaded.wasm": "/ort-wasm-simd-threaded.wasm",
};

let session: ort.InferenceSession | null = null;
let is_loading = false;

export async function load_onnx_model(): Promise<ort.InferenceSession> {
  if (session) {
    return session;
  }

  if (is_loading) {
    while (is_loading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return session!;
  }

  is_loading = true;
  try {
    const cache = await caches.open("onnx-model-cache");
    const signedUrlResponse = await fetch("/api/get-model-url");
    if (!signedUrlResponse.ok) {
      throw new Error("Failed to get signed URL");
    }
    const { url: model_url } = await signedUrlResponse.json();

    let response = await cache.match(model_url);

    if (!response) {
      response = await fetch(model_url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch the model: ${response.status} ${response.statusText}`
        );
      }
      await cache.put(model_url, response.clone());
    }

    const model_data = await response.arrayBuffer();
    session = await ort.InferenceSession.create(model_data);
    return session;
  } catch (error) {
    console.error("Error loading ONNX model:", error);
    throw error;
  } finally {
    is_loading = false;
  }
}

const preprocess_image = (image_data: ImageData): Float32Array => {
  const { data, width, height } = image_data;
  const preprocessed_data = new Float32Array(3 * 224 * 224);
  const mean_values = [0.485, 0.456, 0.406];
  const std_values = [0.229, 0.224, 0.225];

  for (let h = 0; h < 224; h++) {
    for (let w = 0; w < 224; w++) {
      for (let c = 0; c < 3; c++) {
        const value = data[(h * width + w) * 4 + c] / 255.0;
        preprocessed_data[c * 224 * 224 + h * 224 + w] =
          (value - mean_values[c]) / std_values[c];
      }
    }
  }

  return preprocessed_data;
};

const run_inference = async (
  session: ort.InferenceSession,
  input_tensor: ort.Tensor
): Promise<number> => {
  const feeds = { input: input_tensor };
  const output_map = await session.run(feeds);
  const output_tensor = output_map.output as ort.Tensor;
  const scores = output_tensor.data as Float32Array;
  const probability = 1 - scores[0];
  return probability;
};

export interface DetectionResult {
  is_handstand: boolean;
  probability: number;
}

export const process_image = async (
  image_url: string,
  model: ort.InferenceSession
): Promise<DetectionResult> => {
  const img = new window.Image();
  img.src = image_url;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Center crop
  const size = Math.min(img.width, img.height);
  const x = (img.width - size) / 2;
  const y = (img.height - size) / 2;

  // Resize to 256x256, then center crop to 224x224
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = 256;
  tempCanvas.height = 256;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) throw new Error("Failed to get temp canvas context");

  tempCtx.drawImage(img, x, y, size, size, 0, 0, 256, 256);
  ctx.drawImage(tempCanvas, 16, 16, 224, 224, 0, 0, 224, 224);

  const image_data = ctx.getImageData(0, 0, 224, 224);
  const preprocessed_data = preprocess_image(image_data);

  const input_tensor = new ort.Tensor(
    "float32",
    preprocessed_data,
    [1, 3, 224, 224]
  );
  const probability = await run_inference(model, input_tensor);
  const is_handstand = probability >= 0.5;

  return { is_handstand, probability };
};
