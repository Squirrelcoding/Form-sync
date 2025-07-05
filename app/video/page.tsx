"use client";

import { Box, Button, Card, Center, Flex, Heading } from "@chakra-ui/react";
import setupMediapipe from "@/lib/setup";
import { calculateSimilarity } from '@/lib/measure';
import { DrawingUtils, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import PoseVideo from '@/components/PoseVideo';

export default async function Video() {

    
    // Canvas refs for drawing pose landmarks
    const canvas1Ref = useRef<HTMLCanvasElement>(null);
    const canvas2Ref = useRef<HTMLCanvasElement>(null);

    // State for webcam results and similarity score
    const [webcamResult, setWebcamResult] = useState<null | PoseLandmarkerResult>(null);
    const [similarity, setSimilarity] = useState<number>(0);

    // Webcam component refs and state
    const webcamContainerRef = useRef<HTMLDivElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [webcamDimensions, setWebcamDimensions] = useState({ width: 0, height: 0 });
    const [videoPoseLandMarker, setVideoPoseLandMarker] = useState<PoseLandmarker | null>(null);
    const [tracking, setTracking] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Callback for video pose detection
    const videoCallback = (result: PoseLandmarkerResult) => {
        const canvas = canvas1Ref.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        if (result.landmarks.length > 0 && webcamResult?.landmarks.length) {
            drawResult(result, canvas, ctx);
            setSimilarity(calculateSimilarity(result.landmarks[0], webcamResult.landmarks[0]));
        }
    };

    // Callback for webcam pose detection
    const webcamCallback = (result: PoseLandmarkerResult) => {
        const canvas = canvas2Ref.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        setWebcamResult(result);
        drawResult(result, canvas, ctx);
    };

    // Set up mediapipe and resize observer for webcam
    useEffect(() => {
        setupMediapipe(setVideoPoseLandMarker, "VIDEO");

        const observer = new ResizeObserver((entries) => {
            if (!webcamContainerRef.current) return;

            const containerWidth = webcamContainerRef.current.clientWidth;
            const calculatedHeight = (containerWidth * 9) / 16;

            setWebcamDimensions({
                width: containerWidth,
                height: calculatedHeight
            });
        });

        if (webcamContainerRef.current) {
            observer.observe(webcamContainerRef.current);
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
            intervalRef.current = setInterval(() => predictWebcam(), 1);
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
        if (!webcamRef.current || !videoPoseLandMarker || !canvas2Ref.current || !webcamContainerRef.current) return;

        const video = webcamRef.current.video!;
        const canvas = canvas2Ref.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = webcamDimensions;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = width;
        canvas.height = height;

        const timestamp = performance.now();
        videoPoseLandMarker.detectForVideo(video, timestamp, (result: PoseLandmarkerResult) => {
            webcamCallback(result);
        });
    };

    const toggleTracking = () => {
        setTracking((prev) => !prev);
    };

    const drawResult = (result: PoseLandmarkerResult, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
                radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
        }
    };

    return (
        <>
            <Flex gap={6} direction={{ base: "column", md: "row" }} wrap="wrap" justify="center">
                <Card.Root maxW="lg" flex="1">
                    <Card.Body>
                        <PoseVideo callback={videoCallback} />
                        <canvas ref={canvas1Ref} width={1280} height={720} className="hidden" />
                    </Card.Body>
                </Card.Root>

                <Card.Root maxW="xl" flex="1">
                    <Card.Body p={0}>
                        <Box
                            ref={webcamContainerRef}
                            position="relative"
                            aspectRatio={16 / 9}
                            overflow="hidden"
                            width="100%"
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
                                    aspectRatio: 16 / 9
                                }}
                            />
                            <canvas
                                ref={canvas2Ref}
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
                                {tracking ? "Stop Tracking" : "Start Tracking"}
                            </Button>
                        </Box>
                    </Card.Body>
                </Card.Root>
            </Flex>

            <Center mt={8}>
                <Heading as="h1" size="4xl" fontWeight="bold">
                    {similarity}
                </Heading>
            </Center>
        </>
    );
}