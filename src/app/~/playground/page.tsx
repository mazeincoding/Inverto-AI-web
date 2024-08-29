"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CameraOff, X } from "lucide-react";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { Layout } from "@/components/dashboard/layout";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import {
  load_onnx_model,
  process_image,
  DetectionResult,
} from "@/utils/handstand-detection";
import { Loader2 } from "lucide-react";
import * as ort from "onnxruntime-web";
import { save_handstand_history } from "@/actions/history";

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
  const [is_handstand_detected, set_is_handstand_detected] = useState(false);
  const detection_interval_ref = useRef<NodeJS.Timeout | null>(null);
  const [session_start_time, set_session_start_time] = useState<number | null>(
    null
  );
  const [last_handstand_time, set_last_handstand_time] = useState<
    number | null
  >(null);
  const [is_model_loaded, set_is_model_loaded] = useState(false);
  const [is_model_loading, set_is_model_loading] = useState(false);
  const [show_camera, set_show_camera] = useState(false);
  const [camera_error, set_camera_error] = useState<string | null>(null);
  const [model, set_model] = useState<ort.InferenceSession | null>(null);
  const [timer_running, set_timer_running] = useState(false);
  const timer_ref = useRef<NodeJS.Timeout | null>(null);
  const [handstand_start_time, set_handstand_start_time] = useState<number | null>(null);
  const [total_handstand_duration, set_total_handstand_duration] = useState(0);

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

  const handle_session_end = async (): Promise<void> => {
    set_is_session_active(false);
    set_is_fullscreen(false);
    set_show_camera(false);
    reset_timer();

    if (total_handstand_duration > 0) {
      console.log("Attempting to save handstand history...");
      try {
        const result = await save_handstand_history(total_handstand_duration, new Date());
        console.log("Save handstand history result:", result);
        if (result.error) {
          console.error("Failed to save handstand history:", result.error);
          set_error(`Failed to save handstand history: ${result.error}`);
        } else {
          console.log("Handstand history saved successfully");
        }
      } catch (error) {
        console.error("Error while saving handstand history:", error);
        set_error("An unexpected error occurred while saving handstand history.");
      }
    } else {
      console.log("No handstand detected, not saving history.");
    }

    // Reset state
    set_elapsed_time(0);
    set_session_start_time(null);
    set_last_handstand_time(null);
    set_handstand_start_time(null);
    set_total_handstand_duration(0);
  };

  const handle_start_stop = async (): Promise<void> => {
    if (is_session_active) {
      await handle_session_end();
    } else {
      set_is_model_loading(true);
      set_is_fullscreen(true);
      try {
        const loaded_model = await load_onnx_model();
        set_model(loaded_model);
        set_is_model_loaded(true);
        set_is_session_active(true);
        set_elapsed_time(0);
        set_error(null);
        set_session_start_time(Date.now());
        set_show_camera(true);
      } catch (error) {
        console.error("Error loading ONNX model:", error);
        set_error(
          `Failed to load handstand detection model: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Please try again.`
        );
        set_is_fullscreen(false);
      } finally {
        set_is_model_loading(false);
      }
    }
  };

  const handle_close_session = async (): Promise<void> => {
    await handle_session_end();
  };

  const handle_toggle_camera = (): void => {
    set_is_front_camera(!is_front_camera);
  };

  const reset_timer = useCallback(() => {
    set_elapsed_time(0);
    set_timer_running(false);
    if (timer_ref.current) {
      clearInterval(timer_ref.current);
      timer_ref.current = null;
    }
  }, []);

  const detect_handstand = useCallback(async () => {
    if (!webcam_ref.current || !is_model_loaded || !model) return;

    const image_src = webcam_ref.current.getScreenshot();
    if (!image_src) return;

    try {
      const result: DetectionResult = await process_image(image_src, model);
      set_is_handstand_detected(result.is_handstand);

      const current_time = Date.now();

      if (result.is_handstand) {
        if (!handstand_start_time) {
          set_handstand_start_time(current_time);
        }
        set_last_handstand_time(current_time);
      } else {
        if (handstand_start_time && last_handstand_time) {
          const handstand_duration = Math.round((last_handstand_time - handstand_start_time) / 1000);
          set_total_handstand_duration(prev => prev + handstand_duration);
          set_handstand_start_time(null);
        }
      }

      if (!timer_running && result.is_handstand) {
        set_timer_running(true);
      } else if (timer_running && !result.is_handstand && last_handstand_time && current_time - last_handstand_time > 1000) {
        set_timer_running(false);
      }
    } catch (error) {
      console.error("Error detecting handstand:", error);
    }
  }, [is_model_loaded, model, timer_running, handstand_start_time, last_handstand_time]);

  useEffect(() => {
    if (timer_running) {
      timer_ref.current = setInterval(() => {
        set_elapsed_time((prev) => prev + 1);
      }, 1000);
    } else if (timer_ref.current) {
      clearInterval(timer_ref.current);
      timer_ref.current = null;
    }

    return () => {
      if (timer_ref.current) {
        clearInterval(timer_ref.current);
      }
    };
  }, [timer_running]);

  useEffect(() => {
    if (is_fullscreen && has_camera && show_camera) {
      detection_interval_ref.current = setInterval(detect_handstand, 500);
    } else {
      if (detection_interval_ref.current) {
        clearInterval(detection_interval_ref.current);
      }
    }

    return () => {
      if (detection_interval_ref.current) {
        clearInterval(detection_interval_ref.current);
      }
    };
  }, [is_fullscreen, has_camera, show_camera, detect_handstand]);

  const handle_camera_error = useCallback((error: string) => {
    console.error("Camera error:", error);
    set_camera_error(error);
    set_has_camera(false);
  }, []);

  const handle_camera_start = useCallback(() => {
    set_camera_error(null);
  }, []);

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
              disabled={is_model_loading}
            >
              {is_model_loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Camera...
                </>
              ) : is_session_active ? (
                "Stop Session"
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {has_camera === null || has_camera
              ? "Click 'Start Session' to begin."
              : "It looks like your device doesn't have a camera. You can still use the timer manually."}
          </p>
        </CardContent>
        {is_fullscreen && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="relative h-full">
              {is_model_loading ? (
                <div className="h-full flex items-center justify-center flex-col">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="text-lg font-semibold">
                    Getting ready to spot your handstands...
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Just a moment while we warm up!
                  </p>
                </div>
              ) : show_camera && has_camera ? (
                <>
                  <Webcam
                    ref={webcam_ref}
                    mirrored={true}
                    videoConstraints={{
                      facingMode: is_front_camera ? "user" : "environment",
                      aspectRatio: orientation === "portrait" ? 9 / 16 : 16 / 9,
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                    }}
                    onUserMediaError={(error) =>
                      handle_camera_error(
                        typeof error === "string" ? error : error.message
                      )
                    }
                    onUserMedia={handle_camera_start}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)",
                    }}
                  />
                  {camera_error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="text-center p-4 bg-background rounded-lg shadow-lg">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Camera Error
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {camera_error}
                        </p>
                        <Button
                          onClick={() => window.location.reload()}
                          className="mt-4"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}
                </>
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
              {has_camera && show_camera && (
                <Button
                  onClick={handle_toggle_camera}
                  variant="outline"
                  className="absolute top-4 left-4 bg-background/50 hover:bg-background/75"
                  disabled={is_model_loading}
                >
                  Switch Camera
                </Button>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
                <div className="text-4xl font-bold text-white bg-background/50 px-4 py-2 rounded">
                  {format_time(elapsed_time)}
                </div>
                {show_camera && (
                  <div className="flex items-center space-x-2 bg-background/50 px-4 py-2 rounded">
                    {is_handstand_detected ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span className="text-white font-semibold">
                          Handstand Detected
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-red-500" />
                        <span className="text-white font-semibold">
                          No Handstand Detected
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
