"use client";

import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CameraOff } from "lucide-react";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Layout } from "@/components/dashboard/layout";

const PlaygroundContent: React.FC = () => {
  const [is_session_active, set_is_session_active] = useState(false);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [is_front_camera, set_is_front_camera] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [has_camera, set_has_camera] = useState<boolean | null>(null);
  const webcam_ref = useRef<Webcam>(null);

  const format_time = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const check_camera_availability = async (): Promise<void> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const video_devices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      set_has_camera(video_devices.length > 0);
    } catch (err) {
      console.error("Error checking camera availability:", err);
      set_has_camera(false);
    }
  };

  useEffect(() => {
    check_camera_availability();
  }, []);

  const handle_start_stop = async (): Promise<void> => {
    if (is_session_active) {
      set_is_session_active(false);
      // Here you would typically save the session data
    } else {
      if (!has_camera) {
        set_error(
          "No camera detected. You can still use the timer without video."
        );
      }
      set_is_session_active(true);
      set_elapsed_time(0);
      set_error(null);
    }
  };

  const handle_toggle_camera = (): void => {
    set_is_front_camera(!is_front_camera);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Handstand Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">
              {format_time(elapsed_time)}
            </div>
            <Button
              onClick={handle_start_stop}
              size="lg"
              className="mb-4"
              variant="ghost"
            >
              {is_session_active ? "Stop Session" : "Start Session"}
            </Button>
          </div>
          {is_session_active && (
            <div className="space-y-4">
              {has_camera ? (
                <div className="relative aspect-video">
                  <Webcam
                    ref={webcam_ref}
                    mirrored={is_front_camera}
                    videoConstraints={{
                      facingMode: is_front_camera ? "user" : "environment",
                    }}
                    onUserMediaError={() =>
                      set_error(
                        "Failed to access camera. Please check your permissions and try again."
                      )
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <CameraOff className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {has_camera && (
                <div className="flex justify-center">
                  <Button onClick={handle_toggle_camera} variant="outline">
                    Switch Camera
                  </Button>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            {has_camera
              ? "The timer will automatically start when you enter a handstand and stop when you exit."
              : "It looks like your device doesn't have a camera. You can still use the timer manually."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Playground() {
  return (
    <>
      <WelcomeDialog />
      <Layout page_title="Playground">
        <PlaygroundContent />
      </Layout>
    </>
  );
}
