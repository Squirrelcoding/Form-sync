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

    // States relating to the connection 
    const [myId, setMyId] = useState<string>('');
    const [remoteId, setRemoteId] = useState<string>('');
    const [peer, setPeer] = useState<Peer | null>(null);
    const [callActive, setCallActive] = useState(false);
    const [similarity, setSimilarity] = useState<number>(0);

    const poseResultRef = useRef<PoseLandmarkerResult | null>(null);

    // The canvas that OUR webcam images will be drawn onto
    const webcamCanvasRef = useRef<HTMLCanvasElement>(null);

    // The canvas that the remote pose results will be drawn onto
    const remoteCanvasRef = useRef<HTMLCanvasElement>(null);

    // The remote video frame
    const remoteVideoRef = useRef<null | HTMLVideoElement>(null);

    // First do the simple connection stuff
    useEffect(() => {
        const p = new Peer();
        setPeer(p);

        p.on('open', (id) => {
            console.log("HERE");
            setMyId(id);
        });

        p.on('call', (call) => {
            const stream = webcamCanvasRef.current!.captureStream();
            call.answer(stream);
            call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    setCallActive(true);
                }
            });
        });

        p.on('connection', (conn) => {
            const canvas = remoteCanvasRef.current!
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            conn.on('data', (data) => {
                const result = data as PoseLandmarkerResult;
                if (poseResultRef.current && result.landmarks.length > 0) {
                    setSimilarity(calculateSimilarity(result.landmarks[0], poseResultRef.current.landmarks[0]));
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

        // 1. Start media call
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            const call = peer.call(remoteId, stream);
            call.on('stream', (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    setCallActive(true);
                }
            });
        });

        // 2. Open data connection for pose results
        const conn = peer.connect(remoteId);

        conn.on('open', () => {
            console.log("Data channel open");

            const sendInterval = setInterval(() => {
                if (!poseResultRef.current) return;

                conn.send(poseResultRef.current);
            }, 500);

            // Optional: clear interval when connection closes
            conn.on('close', () => clearInterval(sendInterval));
        });
    };



    const callback = (result: PoseLandmarkerResult) => {
        const canvas = webcamCanvasRef.current!;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        poseResultRef.current = result;
    }

    return (
        <Flex direction="column" minH="100vh" p={4}>
            {/* Video Call Section */}
            <Flex gap={6} wrap="wrap" justify="center" flex={1}>
                {/* Local Video Card */}
                <Card.Root flex="1" minW="300px" maxW="600px">
                    <Card.Header>
                        <Heading size="md">Local Video</Heading>
                    </Card.Header>
                    <Card.Body>
                        <PoseWebCam callback={callback} delay={0} />
                    </Card.Body>
                </Card.Root>

                {/* Remote Video Card */}
                <Card.Root flex="1" minW="300px" maxW="600px">
                    <Card.Header>
                        <Heading size="md">Remote Video</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Box
                            as="video"
                            ref={remoteVideoRef}
                            // autoPlay={true}
                            // playsInline
                            width="100%"
                            height="auto"
                            borderRadius="md"
                        />
                    </Card.Body>
                </Card.Root>
            </Flex>

            {/* Controls and Info Section */}
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
