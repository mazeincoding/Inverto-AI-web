"use client";

import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CameraOff, X } from "lucide-react";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Layout } from "@/components/dashboard/layout";
import { cn } from "@/lib/utils";

const PlaygroundContent: React.FC = () => {
  const [is_session_active, set_is_session_active] = useState(false);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [is_front_camera, set_is_front_camera] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [has_camera, set_has_camera] = useState<boolean | null>(null);
  const [orientation, set_orientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [is_fullscreen, set_is_fullscreen] = useState(false);
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

  const update_orientation = () => {
    if (window.screen.orientation) {
      set_orientation(
        window.screen.orientation.type.startsWith("portrait")
          ? "portrait"
          : "landscape"
      );
    } else if (window.orientation !== undefined) {
      set_orientation(
        Math.abs(window.orientation as number) === 90 ? "landscape" : "portrait"
      );
    }
  };

  useEffect(() => {
    check_camera_availability();
    update_orientation();
    window.addEventListener("orientationchange", update_orientation);
    return () => {
      window.removeEventListener("orientationchange", update_orientation);
    };
  }, []);

  const handle_start_stop = async (): Promise<void> => {
    if (is_session_active) {
      set_is_session_active(false);
      set_is_fullscreen(false);
      // Here you would typically save the session data
    } else {
      if (!has_camera) {
        set_error(
          "No camera detected. You can still use the timer without video."
        );
      }
      set_is_session_active(true);
      set_is_fullscreen(true);
      set_elapsed_time(0);
      set_error(null);
    }
  };

  const handle_close_session = (): void => {
    set_is_session_active(false);
    set_is_fullscreen(false);
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
              className={cn(
                "mb-4",
                is_session_active
                  ? "bg-destructive hover:bg-destructive"
                  : "bg-primary"
              )}
            >
              {is_session_active ? "Stop Session" : "Start Session"}
            </Button>
          </div>
          {is_session_active && is_fullscreen && (
            <div className="fixed inset-0 z-50 bg-background">
              <div className="relative h-full">
                {has_camera ? (
                  <Webcam
                    ref={webcam_ref}
                    mirrored={is_front_camera}
                    videoConstraints={{
                      facingMode: is_front_camera ? "user" : "environment",
                      aspectRatio: orientation === "portrait" ? 9 / 16 : 16 / 9,
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
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
                ) : (
                  <div className="h-full bg-muted flex items-center justify-center">
                    <CameraOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Button
                  onClick={handle_close_session}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/50 hover:bg-background/75"
                >
                  <X className="h-6 w-6" />
                </Button>
                {has_camera && (
                  <Button
                    onClick={handle_toggle_camera}
                    variant="outline"
                    className="absolute top-4 left-4 bg-background/50 hover:bg-background/75"
                  >
                    Switch Camera
                  </Button>
                )}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white bg-background/50 px-4 py-2 rounded">
                  {format_time(elapsed_time)}
                </div>
              </div>
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
