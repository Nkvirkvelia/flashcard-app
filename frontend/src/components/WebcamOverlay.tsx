import React, { useState, useRef, useEffect } from "react";
import "./WebcamOverlay.css";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs";

const WebcamOverlay: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true }); // Just trigger permission request
      setPermissionStatus("granted"); // After grant, we'll set up stream inside useEffect
    } catch (error) {
      console.error("Camera access denied", error);
      setPermissionStatus("denied");
    }
  };

  useEffect(() => {
    let stream: MediaStream;

    if (permissionStatus === "granted" && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = async () => {
            // Video feed ready — now load MediaPipe Hands
            const detector = await handPoseDetection.createDetector(
              handPoseDetection.SupportedModels.MediaPipeHands,
              {
                runtime: "mediapipe",
                modelType: "full",
                solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
              }
            );
            detectorRef.current = detector;
            startDetectionLoop();
          };
        }
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [permissionStatus]);

  const startDetectionLoop = () => {
    const detect = async () => {
      if (videoRef.current && detectorRef.current) {
        const hands = await detectorRef.current.estimateHands(videoRef.current);
        console.log("Detected Hands:", hands);
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  return (
    <div id="gesture-overlay">
      {permissionStatus === "pending" && (
        <span id="gesture-access-button" onClick={requestCameraAccess}>
          Access Camera
        </span>
      )}

      {permissionStatus === "denied" && (
        <div onClick={requestCameraAccess}>
          <span id="gesture-access-button">Permission Denied - Retry</span>
        </div>
      )}

      {permissionStatus === "granted" && (
        <video
          id="gesture-video"
          autoPlay
          playsInline
          muted
          ref={videoRef}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
};

export default WebcamOverlay;
