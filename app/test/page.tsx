"use client";

import { useRef } from "react";
import Webcam from "react-webcam";

export default function Page() {
    const webcamRef = useRef<Webcam>(null);
    
    return <>
        <p>webcam</p>
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
    </>
}