import React, { useState, useRef, useEffect } from "react";
import "./WebcamOverlay.css";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs";
import { classifyGesture, HandData } from "../utils/gestureUtils";

const GESTURE_HOLD_DURATION = 3000; // 3 seconds

const gestureColors: Record<string, string> = {
  easy: "green",
  hard: "orange",
  wrong: "red",
};

const WebcamOverlay: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [gesture, setGesture] = useState<
    "easy" | "hard" | "wrong" | "none" | "ambiguous"
  >("none");
  const [gestureStartTime, setGestureStartTime] = useState<number | null>(null);
  const [borderProgress, setBorderProgress] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionStatus("granted");
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
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [permissionStatus]);

  const startDetectionLoop = () => {
    const detect = async () => {
      if (videoRef.current && detectorRef.current) {
        const hands = await detectorRef.current.estimateHands(videoRef.current);
        const classified = classifyGesture(hands as HandData[]);

        if (classified === gesture) {
          if (gestureStartTime) {
            const duration = Date.now() - gestureStartTime;
            const progress = Math.min(duration / GESTURE_HOLD_DURATION, 1);
            setBorderProgress(progress);
          } else {
            setGestureStartTime(Date.now());
            setBorderProgress(0);
          }
        } else {
          setGesture(classified);
          setGestureStartTime(
            classified !== "none" && classified !== "ambiguous"
              ? Date.now()
              : null
          );
          setBorderProgress(0);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    detect();
  };

  const overlayStyle: React.CSSProperties = {
    border:
      gesture !== "none" && gesture !== "ambiguous"
        ? `4px solid ${gestureColors[gesture]}`
        : "4px solid transparent",
    boxShadow: gestureStartTime
      ? `0 0 0 ${borderProgress * 10}px ${gestureColors[gesture]}`
      : undefined,
    transition: "box-shadow 0.1s linear, border 0.1s linear",
  };

  return (
    <div id="gesture-overlay" style={overlayStyle}>
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
