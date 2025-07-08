"use client";

import {
  DrawingUtils,
  NormalizedLandmark,
  PoseLandmarker,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { calculateSimilarity } from "../../lib/measure";
import React, { useRef, useEffect, useState } from "react";
import PoseWebcam from "@/components/PoseWebcam";
import setupMediapipe from "@/lib/setup";
import { AbsoluteCenter, Card, Center, Flex } from "@chakra-ui/react";
import { createClient } from '@/utils/supabase/client'
import { redirect } from "next/navigation";
import io from 'socket.io-client';
import { User } from "@supabase/supabase-js";

const PoseEstimation = () => {

  const [userData, setUserData] = useState<User | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [imagePoseLandMarker, setImagePoseLandMarker] =
    useState<PoseLandmarker | null>(null);
  const [imageResult, setImageResult] = useState<NormalizedLandmark[] | null>(
    null
  );
  const [poseResult, setPoseResult] = useState<number>(0);
  const [imageURL, setImageURL] = useState<string | null>(null);

  // Initialize user data
  useEffect(() => {
    if (userData) return;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect('/login')
      }
      console.log(data);
      setUserData(data.user);
    })();
  }, []);

  // Initialize image imagePoseLandMarker
  useEffect(() => {
    setupMediapipe(setImagePoseLandMarker, "IMAGE");
    return () => {
      setImagePoseLandMarker(null);
    };
  }, []);

  // Initialize a connection to the database to record the workout
  useEffect(() => {
    if (!userData || !imageURL) return;
    const supabase = createClient();

    const socket = io();
    console.log("CONNECTING");

    socket.on('disconnect', async () => {
      const { error } = await supabase
        .from('workouts')
        .update({
          length: Date.now() - startTime
        }).eq('client_id', userData.id);
    });

    socket.on('connect', async () => {
      console.log('connected', socket.id);
      const workout_id = crypto.randomUUID();
      const start_time = new Date().toISOString();
      const { error } = await supabase
        .from('workouts')
        .insert({
          workout_id,
          client_id: userData.id,
          coach_id: userData.id,
          start_time,
          end_time: null,
          type: "IMAGE_SINGLE",
        });

      // Send the workout ID to the server
      socket.emit("recieve", {workout_id, start_time});
    });

    return () => {
      socket.disconnect();
    };
  }, [imageURL]);

  const callback = (result: PoseLandmarkerResult) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Error: imageResult is undefined for some reason
    setPoseResult(calculateSimilarity(result.landmarks[0], imageResult!));
    drawResult(result, canvas, ctx);
  };

  const handleImageLoad = async () => {
    if (!imagePoseLandMarker || !imageRef.current) return;

    try {
      const img = imageRef.current!;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Now call detect with the canvas instead of image element
      const result = imagePoseLandMarker.detect(canvas);
      setImageResult(result.landmarks[0]);
    } catch (err) {
      console.error("Error detecting pose on image:", err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageURL(url);

    // Start a new workout in the database
  };

  return (
    <>
      {!imageURL && (
        <Center h="100vh">
          <Card.Root>
            <Card.Body>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </Card.Body>
          </Card.Root>
        </Center>
      )}
      {imageURL && (
        <>
          <Flex gap={6} direction="row" wrap="wrap" justify={"center"}>
            <Card.Root maxW="lg" flex="1">
              <img
                src={imageURL}
                alt="Preview"
                className="max-w-xs border rounded shadow"
                ref={imageRef}
                onLoad={(e) => handleImageLoad()}
              />
            </Card.Root>
            <Card.Root maxW="xl" flex="1">
              <PoseWebcam callback={callback} delay={500} />
            </Card.Root>
          </Flex>
          <AbsoluteCenter>
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
          </AbsoluteCenter>
          <AbsoluteCenter>
            <p>Similarity: {poseResult}</p>
          </AbsoluteCenter>
        </>
      )}
    </>
  );
};

export default PoseEstimation;

const drawResult = (
  result: PoseLandmarkerResult,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmark of result.landmarks) {
    drawingUtils.drawLandmarks(landmark, {
      radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
    });
    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
  }
};
