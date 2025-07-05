"use client";

import { Box, Button } from "@chakra-ui/react";
import setupMediapipe from "@/lib/setup";
import { PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

interface PoseParameters {
  callback: (a: PoseLandmarkerResult) => void;
  delay: number;
}

export default function PoseEstimation({ callback, delay }: PoseParameters) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [videoPoseLandMarker, setVideoPoseLandMarker] = useState<PoseLandmarker | null>(null);
  const [tracking, setTracking] = useState(false);

  // Set up mediapipe and resize observer
  useEffect(() => {
    setupMediapipe(setVideoPoseLandMarker, "VIDEO");

    const observer = new ResizeObserver((entries) => {
      if (!containerRef.current) return;
      
      // Calculate dimensions while maintaining 16:9 aspect ratio
      const containerWidth = containerRef.current.clientWidth;
      const calculatedHeight = (containerWidth * 9) / 16;
      
      setDimensions({
        width: containerWidth,
        height: calculatedHeight
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      setVideoPoseLandMarker(null);
    };
  }, []);

  // Handle tracking state changes
  useEffect(() => {
    if (!videoPoseLandMarker || !webcamRef.current) return;

    if (tracking) {
      intervalRef.current = setInterval(() => predictWebcam(), delay);
    } else {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tracking, videoPoseLandMarker]);

  const predictWebcam = () => {
    if (!webcamRef.current || !videoPoseLandMarker || !canvasRef.current || !containerRef.current) return;

    const video = webcamRef.current.video!;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use the container dimensions instead of video dimensions
    const { width, height } = dimensions;
    
    // Set canvas display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Set canvas drawing buffer size (adjust if needed for quality)
    canvas.width = width;
    canvas.height = height;

    const timestamp = performance.now();
    videoPoseLandMarker.detectForVideo(video, timestamp, (result: PoseLandmarkerResult) => {
      callback(result);
    });
  };

  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      aspectRatio={16 / 9}
      border="1px solid"
      borderColor="gray.300"
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
      width="100%"
      maxWidth="1000px" // Set your desired maximum width
      margin="0 auto" // Center the container
    >
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        videoConstraints={{
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16/9
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
      />
      <Button
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        colorScheme="blue"
        size="sm"
        onClick={toggleTracking}
        shadow="md"
        zIndex={1}
      >
        {tracking ? "Stop Tracking" : "Start Tracking!  "}
      </Button>
    </Box>
  );
}