"use client";

import PoseWebcam from "@/components/PoseWebcam";
import { PoseLandmarkerResult } from "@mediapipe/tasks-vision";

export default function Page() {
    const callback = (a: PoseLandmarkerResult): void => {
        // throw new Error("Function not implemented.");
    }
    return <>
        <PoseWebcam callback={callback} delay={500} />
    </>
}