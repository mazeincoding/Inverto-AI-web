"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle, XCircle } from "lucide-react";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Layout } from "@/components/dashboard/layout";
import Image from "next/image";

const PlaygroundImageContent: React.FC = () => {
  const [selected_image, set_selected_image] = useState<string | null>(null);
  const [is_processing, set_is_processing] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [is_handstand_detected, set_is_handstand_detected] = useState<
    boolean | null
  >(null);
  const file_input_ref = useRef<HTMLInputElement>(null);

  const handle_image_upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => set_selected_image(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handle_process_image = async () => {
    if (!selected_image) return;

    set_is_processing(true);
    set_error(null);

    try {
      const response = await fetch("/api/detect-handstand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selected_image }),
      });

      const result = await response.json();
      set_is_handstand_detected(result.is_handstand);
    } catch (error) {
      console.error("Error processing image:", error);
      set_error("Failed to process image. Please try again.");
    } finally {
      set_is_processing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Handstand Image Detector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handle_image_upload}
              className="hidden"
              ref={file_input_ref}
            />
            <Button
              onClick={() => file_input_ref.current?.click()}
              size="lg"
              className="w-full max-w-xs"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
            {selected_image && (
              <div className="relative w-full max-w-xs aspect-square">
                <Image
                  src={selected_image}
                  alt="Uploaded image"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
            <Button
              onClick={handle_process_image}
              size="lg"
              className="w-full max-w-xs"
              disabled={!selected_image || is_processing}
            >
              {is_processing ? "Processing..." : "Detect Handstand"}
            </Button>
            {is_handstand_detected !== null && (
              <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded">
                {is_handstand_detected ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <span className="font-semibold">Handstand Detected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    <span className="font-semibold">No Handstand Detected</span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PlaygroundImage() {
  return (
    <>
      <WelcomeDialog />
      <Layout page_title="Playground Image">
        <PlaygroundImageContent />
      </Layout>
    </>
  );
}
