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

  console.log("Attempting to fetch model from GCS");
  console.log("Bucket:", bucketName);
  console.log("File:", fileName);

  try {
    const [fileContent] = await storage
      .bucket(bucketName)
      .file(fileName)
      .download();

    console.log("Model downloaded successfully");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading the model:", error);
    return NextResponse.json(
      {
        error: "Failed to download the model",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
