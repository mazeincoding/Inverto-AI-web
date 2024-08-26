import { NextRequest, NextResponse } from "next/server";
import * as onnxruntime from "onnxruntime-node";
import sharp from "sharp";
import path from "path";

let model: onnxruntime.InferenceSession | null = null;

async function load_model() {
  if (!model) {
    const model_path = path.join(process.cwd(), 'src', 'app', 'api', 'detect-handstand', 'handstand_model.onnx');
    model = await onnxruntime.InferenceSession.create(model_path);
  }
  return model;
}

function pad_to_square(image_buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    sharp(image_buffer)
      .metadata()
      .then(metadata => {
        const max_size = Math.max(metadata.width || 0, metadata.height || 0);
        return sharp(image_buffer)
          .resize(max_size, max_size, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
          .toBuffer();
      })
      .then(resolve)
      .catch(reject);
  });
}

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  // Ensure model is loaded
  const inference_model = await load_model();

  // Decode base64 image
  const buffer = Buffer.from(image.split(',')[1], 'base64');

  // Pad to square
  const padded_buffer = await pad_to_square(buffer);

  // Preprocess image
  const preprocessed_image = await sharp(padded_buffer)
    .resize(256, 256)
    .extract({ left: 16, top: 16, width: 224, height: 224 }) // Center crop
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Create tensor from preprocessed image
  const { data, info } = preprocessed_image;
  const float32_array = new Float32Array(3 * 224 * 224);
  
  // Normalize using ImageNet mean and std
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];

  for (let i = 0; i < data.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      const pixel = data[i + c] / 255.0;
      float32_array[c * 224 * 224 + Math.floor(i / 3)] = (pixel - mean[c]) / std[c];
    }
  }

  const input_tensor = new onnxruntime.Tensor('float32', float32_array, [1, 3, 224, 224]);

  // Run inference
  const results = await inference_model.run({ input: input_tensor });
  const output = results.output.data as Float32Array;

  // Process output
  const probability = 1 - output[0]; // Flip the probability
  const is_handstand = probability >= 0.5; // Flip the threshold

  return NextResponse.json({ is_handstand, probability });
}