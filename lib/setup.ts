import { PoseLandmarker } from "@mediapipe/tasks-vision";

export default async function setupMediapipe(
    setPoseLandMarker: React.Dispatch<React.SetStateAction<PoseLandmarker | null>>,
    runningMode: "IMAGE" | "VIDEO"
) {
    const { PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    const poseLandMarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
        },
        runningMode,
        numPoses: 1,
    });

    setPoseLandMarker(poseLandMarker);
};