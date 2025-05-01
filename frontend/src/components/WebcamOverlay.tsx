/**
 * WebcamOverlay Component
 * ------------------------
 * This component provides a webcam overlay for gesture recognition.
 * It uses a gesture recognition library to detect user gestures and trigger
 * corresponding actions in the flashcard practice session.
 */

import React, { useState, useRef, useEffect } from "react";
import "./WebcamOverlay.css";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs";
import { classifyGesture, HandData } from "../utils/gestureUtils";

const GESTURE_HOLD_DURATION = 3000; // Time (ms) to hold a gesture for recognition
const ACTION_FEEDBACK_DURATION = 500; // Time (ms) to display feedback after a gesture
const COOLDOWN_DURATION = 1000; // Time (ms) before another gesture can be recognized

const gestureColors: Record<string, string> = {
  easy: "green",
  hard: "orange",
  wrong: "red",
};

interface WebcamOverlayProps {
  onGestureRecognized: (gesture: string) => void; // Callback for recognized gestures
  active: boolean; // Whether the overlay is active
}

const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  onGestureRecognized,
  active, // Default to inactive
}) => {
  const [permissionStatus, setPermissionStatus] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [gesture, setGesture] = useState<
    "easy" | "hard" | "wrong" | "none" | "ambiguous"
  >("none");
  const [gestureStartTime, setGestureStartTime] = useState<number | null>(null);
  const [borderProgress, setBorderProgress] = useState<number>(0);
  const [status, setStatus] = useState<"detecting" | "triggered" | "cooldown">(
    "detecting"
  );
  const [statusMessage, setStatusMessage] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

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
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [permissionStatus]);

  // Handle gesture recognition timer
  useEffect(() => {
    if (
      active &&
      status === "detecting" &&
      gestureStartTime &&
      gesture !== "none" &&
      gesture !== "ambiguous"
    ) {
      const checkGestureTimer = () => {
        const elapsed = Date.now() - gestureStartTime;

        if (elapsed >= GESTURE_HOLD_DURATION) {
          // Gesture held for required duration - trigger action
          triggerGestureAction(gesture);
        } else {
          // Update progress
          const progress = Math.min(elapsed / GESTURE_HOLD_DURATION, 1);
          setBorderProgress(progress);
          requestAnimationFrame(checkGestureTimer);
        }
      };

      requestAnimationFrame(checkGestureTimer);
    }
  }, [gesture, gestureStartTime, status, active]);

  useEffect(() => {
    if (active) {
      // Only start detection if active prop is true
      if (
        status === "detecting" &&
        permissionStatus === "granted" &&
        detectorRef.current
      ) {
        startDetectionLoop();
        setStatusMessage("Ready for gestures");
      }
    } else {
      // Stop detection when not active
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Reset state when becoming inactive
      if (status !== "detecting") {
        setStatus("detecting");
        setGesture("none");
        setGestureStartTime(null);
        setBorderProgress(0);
      }

      setStatusMessage(
        permissionStatus === "granted" ? "Waiting for card flip..." : ""
      );
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, status, permissionStatus]);

  const triggerGestureAction = (
    recognizedGesture: "easy" | "hard" | "wrong"
  ) => {
    // Stop detection temporarily
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Set to triggered state with 100% filled progress bar
    setStatus("triggered");
    setBorderProgress(1);
    setStatusMessage(`${recognizedGesture.toUpperCase()} recognized!`);

    // Call callback if provided
    if (onGestureRecognized) {
      onGestureRecognized(recognizedGesture);
    }

    // Show feedback briefly
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      // Move to cooldown state
      setStatus("cooldown");
      setStatusMessage("Cooldown...");
      setBorderProgress(0);

      // Set cooldown timer
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = window.setTimeout(() => {
        // Reset all states
        setStatus("detecting");

        // Force a complete reset of gesture detection state
        // We don't set the gesture to "none" here, forcing the detection loop
        // to re-evaluate whatever gesture is currently being shown
        setGestureStartTime(null);
        setStatusMessage("");
        setBorderProgress(0);

        // Resume detection
        startDetectionLoop();
      }, COOLDOWN_DURATION);
    }, ACTION_FEEDBACK_DURATION);
  };

  const startDetectionLoop = () => {
    const detect = async () => {
      if (status !== "detecting") return;

      if (videoRef.current && detectorRef.current) {
        const hands = await detectorRef.current.estimateHands(videoRef.current);
        const classified = classifyGesture(hands as HandData[]);

        // Always update the current gesture
        if (classified !== gesture) {
          setGesture(classified);
          // Reset timer on gesture change
          setGestureStartTime(
            classified !== "none" && classified !== "ambiguous"
              ? Date.now()
              : null
          );
          setBorderProgress(0);
          setStatusMessage(
            classified !== "none" && classified !== "ambiguous"
              ? "Keep holding..."
              : ""
          );
        } else if (
          classified !== "none" &&
          classified !== "ambiguous" &&
          !gestureStartTime
        ) {
          // Same valid gesture but timer was not started yet
          setGestureStartTime(Date.now());
          setStatusMessage("Keep holding...");
        }
      }
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    animationFrameRef.current = requestAnimationFrame(detect);
  };

  const overlayStyle: React.CSSProperties = {
    border:
      gesture !== "none" && gesture !== "ambiguous" && status !== "cooldown"
        ? `4px solid ${gestureColors[gesture]}`
        : "4px solid transparent",
    opacity: active ? 1 : 0.6, // Fade when inactive
  };

  const progressBarStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "4px",
    width: `${borderProgress * 100}%`,
    backgroundColor:
      gesture !== "none" && gesture !== "ambiguous"
        ? gestureColors[gesture]
        : "transparent",
    transition: "width 0.1s linear",
    zIndex: 1001,
  };

  const statusOverlayStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "4px 0",
    fontSize: "14px",
    fontWeight: "bold",
    visibility: statusMessage ? "visible" : "hidden",
    zIndex: 1002,
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
        <>
          <video
            id="gesture-video"
            autoPlay
            playsInline
            muted
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={progressBarStyle}></div>
          <div style={statusOverlayStyle}>{statusMessage}</div>
        </>
      )}
    </div>
  );
};

export default WebcamOverlay;
