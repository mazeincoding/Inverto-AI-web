"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Camera, CameraOff } from "lucide-react";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Layout } from "@/components/dashboard/layout";

const PlaygroundContent: React.FC = () => {
  const [is_timer_running, set_is_timer_running] = useState(false);
  const [elapsed_time, set_elapsed_time] = useState(0);
  const [camera_flipped, set_camera_flipped] = useState(false);
  const [zoom_level, set_zoom_level] = useState(1);
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
      const video_devices = devices.filter(device => device.kind === 'videoinput');
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
    if (is_timer_running) {
      set_is_timer_running(false);
      // Here you would typically save the session data
    } else {
      if (!has_camera) {
        set_error("No camera detected. You can still use the timer without video.");
      }
      set_is_timer_running(true);
      set_elapsed_time(0);
      set_error(null);
    }
  };

  const handle_flip_camera = (): void => {
    set_camera_flipped(!camera_flipped);
  };

  const handle_zoom_change = useCallback((value: number[]) => {
    set_zoom_level(value[0]);
  }, []);

  useEffect(() => {
    if (is_timer_running) {
      const timer = setInterval(() => {
        set_elapsed_time(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [is_timer_running]);

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
            <Button onClick={handle_start_stop} size="lg" className="mb-4">
              {is_timer_running ? "Stop Session" : "Start Session"}
            </Button>
          </div>
          {is_timer_running && (
            <div className="space-y-4">
              {has_camera ? (
                <div className="relative aspect-video">
                  <Webcam
                    ref={webcam_ref}
                    mirrored={camera_flipped}
                    onUserMediaError={() => set_error("Failed to access camera. Please check your permissions and try again.")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: `scale(${zoom_level})`,
                    }}
                  />
                </div>
              ) : (
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <CameraOff className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {has_camera && (
                <div className="flex justify-between items-center">
                  <Button onClick={handle_flip_camera} variant="outline">
                    Flip Camera
                  </Button>
                  <div className="flex items-center space-x-2 flex-grow mx-4">
                    <span className="text-sm">Zoom:</span>
                    <Slider
                      value={[zoom_level]}
                      onValueChange={handle_zoom_change}
                      min={1}
                      max={3}
                      step={0.1}
                    />
                  </div>
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