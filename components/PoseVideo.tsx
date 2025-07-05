"use client";

import setupMediapipe from '@/lib/setup';
import { PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

interface PoseParameters {
  callback: (a: PoseLandmarkerResult) => void
}

export default function SimpleVideoPlayer({ callback }: PoseParameters) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoPoseLandMarker, setVideoPoseLandMarker] = useState<PoseLandmarker | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  useEffect(() => {
    setupMediapipe(setVideoPoseLandMarker, "VIDEO");
    return () => {
      setVideoPoseLandMarker(null);
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    console.log(url);
  };

  const processVideo = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !canvas || !ctx || !videoPoseLandMarker) return;

    const renderFrame = async () => {
      if (video.paused || video.ended) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const timestamp = performance.now();

      videoPoseLandMarker.detectForVideo(video, timestamp, (result: PoseLandmarkerResult) => {
        callback(result);
      });

      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  };

  return (
    <>
      <input type="file" accept="video/*" onChange={handleFileChange} />

      {videoURL && (
        <>
          <video
            ref={videoRef}
            controls
            src={videoURL}
            onPlay={(e) => processVideo()}
          />
          <canvas ref={canvasRef} width={768} height={432} hidden />
        </>
      )}
    </>
  );
}
