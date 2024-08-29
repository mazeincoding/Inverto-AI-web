import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

let storage: Storage;

try {
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : undefined;

  storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials,
  });
} catch (error) {
  console.error("Error initializing Google Cloud Storage:", error);
}

export async function GET() {
  if (!storage) {
    return NextResponse.json(
      { error: "Google Cloud Storage not properly initialized" },
      { status: 500 }
    );
  }

  const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("GOOGLE_CLOUD_BUCKET_NAME is not defined");
  }
  const fileName = "final_handstand_detector_08.onnx";

  try {
    const [fileExists] = await storage.bucket(bucketName).file(fileName).exists();
    if (!fileExists) {
      return NextResponse.json({ error: "Model file not found" }, { status: 404 });
    }

    const fileStream = storage.bucket(bucketName).file(fileName).createReadStream();

    // Create a ReadableStream from the file stream
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (error) => controller.error(error));
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error streaming the model:", error);
    return NextResponse.json(
      {
        error: "Failed to stream the model",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
