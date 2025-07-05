import { NormalizedLandmark } from "@mediapipe/tasks-vision";

const importantPairs = [[11, 12], [11, 23], [23, 24], [12, 24], [12, 14], [14, 16], [11, 13], [13, 15], [24, 26], [26, 28], [23, 25], [25, 27]];

export function calculateSimilarity(landmarksA: NormalizedLandmark[], landmarksB: NormalizedLandmark[]): number {
    let res = 0;
    for (let pair of importantPairs) {
        const v = [landmarksA[pair[1]].y - landmarksA[pair[0]].y, landmarksA[pair[1]].x - landmarksA[pair[0]].x]
        const w = [landmarksB[pair[1]].y - landmarksB[pair[0]].y, landmarksB[pair[1]].x - landmarksB[pair[0]].x]
        let vAngle = Math.atan(v[1] / v[0])
        let wAngle = Math.atan(w[1] / w[0])
        res += (Math.cos(vAngle) - Math.cos(wAngle))**2;
    } 
    return res;
}
