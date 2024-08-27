"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { load_onnx_model, process_image } from "@/utils/handstand-detection";
import * as ort from "onnxruntime-web";

export default function HandstandDetectionPage() {
  const [selected_image, set_selected_image] = useState<string | null>(null);
  const [prediction, set_prediction] = useState<string | null>(null);
  const [probability, set_probability] = useState<number | null>(null);
  const [model, set_model] = useState<ort.InferenceSession | null>(null);
  const [is_loading_model, set_is_loading_model] = useState(true);
  const [is_processing, set_is_processing] = useState(false);

  const handle_image_upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const image_url = URL.createObjectURL(file);
      set_selected_image(image_url);
      set_prediction(null);
      set_probability(null);
    }
  };

  const detect_handstand = useCallback(async () => {
    if (!selected_image || !model) return;

    set_is_processing(true);
    try {
      const prob = await process_image(selected_image, model);
      const is_handstand = prob >= 0.5;
      set_prediction(is_handstand ? "Handstand" : "Not Handstand");
      set_probability(prob);
    } catch (error) {
      console.error("Error during inference:", error);
      set_prediction("Error occurred");
      set_probability(null);
    } finally {
      set_is_processing(false);
    }
  }, [selected_image, model]);

  useEffect(() => {
    load_onnx_model()
      .then((loaded_model) => {
        set_model(loaded_model);
        set_is_loading_model(false);
      })
      .catch((error) => {
        console.error("Error loading model:", error);
        set_is_loading_model(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Handstand Detection</h1>

      <div className="mb-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handle_image_upload}
          className="mb-2"
        />
      </div>

      {selected_image && (
        <div className="mb-4">
          <Image
            src={selected_image}
            alt="Uploaded image"
            width={400}
            height={400}
            className="w-full h-auto object-contain"
          />
        </div>
      )}

      <Button
        onClick={detect_handstand}
        disabled={
          !selected_image || !model || is_loading_model || is_processing
        }
        className="w-full mb-4"
      >
        {is_loading_model
          ? "Loading Model..."
          : is_processing
          ? "Processing..."
          : "Detect Handstand"}
      </Button>

      {prediction && (
        <div className="text-center">
          <p className="text-xl font-bold">{prediction}</p>
          {probability !== null && (
            <p>Probability: {(probability * 100).toFixed(2)}%</p>
          )}
        </div>
      )}
    </div>
  );
}
