import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}"),
});

export async function GET() {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const fileName = "final_handstand_detector_08.onnx";

    const [url] = await storage
      .bucket(bucketName!)
      .file(fileName)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
