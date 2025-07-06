"use client";

import {
    Box,
    Flex,
    Heading,
    Text,
    Input,
    Button,
    Card,
} from "@chakra-ui/react";

import { DrawingUtils, PoseLandmarker, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import PoseWebCam from "../../components/PoseWebcam";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { calculateSimilarity } from "@/lib/measure";

export default function Call({ userInfo }: any) {
    const [myId, setMyId] = useState<string>('');
    const [remoteId, setRemoteId] = useState<string>('');
    const [peer, setPeer] = useState<Peer | null>(null);
    const [callActive, setCallActive] = useState(false);
    const [similarity, setSimilarity] = useState<number>(0);

    const localPoseResultRef = useRef<PoseLandmarkerResult | null>(null);

    const localCanvasRef = useRef<HTMLCanvasElement>(null);
    const remoteCanvasRef = useRef<HTMLCanvasElement>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const p = new Peer();
        setPeer(p);

        p.on('open', (id) => {
            console.log("Peer ID:", id);
            setMyId(id);
        });

        // Handle incoming call
        p.on('call', (call) => {
            // Use getUserMedia to send real webcam feed
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                call.answer(stream);
            });

            call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    setCallActive(true);
                }
            });
        });

        // Handle incoming data connection for pose
        p.on('connection', (conn) => {
            const canvas = remoteCanvasRef.current!;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            conn.on('data', (data) => {
                const result = data as PoseLandmarkerResult;
                if (localPoseResultRef.current && result.landmarks.length > 0) {
                    setSimilarity(calculateSimilarity(result.landmarks[0], localPoseResultRef.current.landmarks[0]));
                }
                drawResult(result, canvas, ctx);
            });
        });

        return () => {
            p.destroy();
        };
    }, []);

    const startCall = () => {
        if (!remoteId || !peer) return;

        // Start local webcam
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Start media call
            const call = peer.call(remoteId, stream);
            call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    setCallActive(true);
                }
            });
        });

        // Start data channel for pose results
        const conn = peer.connect(remoteId);
        conn.on('open', () => {
            console.log("Data channel open");

            const sendInterval = setInterval(() => {
                if (!localPoseResultRef.current) return;
                conn.send(localPoseResultRef.current);
            }, 100);

            conn.on('close', () => clearInterval(sendInterval));
        });
    };

    const poseCallback = (result: PoseLandmarkerResult) => {
        const canvas = localCanvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        localPoseResultRef.current = result;
    }

    return (
        <Flex direction="column" minH="100vh" p={4}>
            <Flex gap={6} wrap="wrap" justify="center" flex={1}>
                {/* Local Video Card */}
                <Card.Root flex="1" minW="300px" maxW="600px">
                    <Card.Header>
                        <Heading size="md">Local Video</Heading>
                    </Card.Header>
                    <Card.Body>
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            width="100%" 
                            height="auto" 
                            style={{ borderRadius: "8px", marginBottom: "8px", display: 'none' }}
                        />
                        <PoseWebCam callback={poseCallback} delay={0} />
                        <canvas ref={localCanvasRef} width={640} height={480} style={{ display: 'none' }}></canvas>
                    </Card.Body>
                </Card.Root>

                {/* Remote Video Card */}
                <Card.Root flex="1" minW="300px" maxW="600px">
                    <Card.Header>
                        <Heading size="md">Remote Video</Heading>
                    </Card.Header>
                    <Card.Body>
                        <video 
                            ref={remoteVideoRef} 
                            autoPlay 
                            playsInline 
                            width="100%" 
                            height="auto" 
                            style={{ borderRadius: "8px", marginBottom: "8px" }}
                        />
                        <canvas ref={remoteCanvasRef} width={640} height={480} style={{ border: "1px solid #ccc" }}></canvas>
                    </Card.Body>
                </Card.Root>
            </Flex>

            <Box mt={6} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
                <Flex align="center" gap={4} mb={4}>
                    <Text fontWeight="bold">Your ID:</Text>
                    <Text>{myId}</Text>
                    <Button size="sm" onClick={() => navigator.clipboard.writeText(myId)}>
                        Copy
                    </Button>
                </Flex>

                <Flex align="center" gap={4} mb={4} wrap="wrap">
                    <Input
                        placeholder="Enter remote peer ID"
                        value={remoteId}
                        onChange={(e) => setRemoteId(e.target.value)}
                        maxW="300px"
                    />
                    <Button
                        colorScheme="blue"
                        onClick={startCall}
                        disabled={callActive}
                    >
                        {callActive ? "Call Active" : "Start Call"}
                    </Button>
                </Flex>

                <Text>
                    Similarity: <strong>{similarity.toFixed(2)}</strong>
                </Text>
            </Box>
            <p>HIGWEJUOFGIKERWUJHJNTFEIRKG: {userInfo.user.email}</p>
        </Flex>
    );
}

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
