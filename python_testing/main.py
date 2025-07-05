import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python.vision.pose_landmarker import PoseLandmarkerResult
from mediapipe.tasks.python import vision

base_options = python.BaseOptions(model_asset_path='model.task')
options = vision.PoseLandmarkerOptions(base_options=base_options)
detector = vision.PoseLandmarker.create_from_options(options)

image1 = mp.Image.create_from_file("images/flexing.jpg")

res1 = detector.detect(image1)

pose_landmarks = []
print(res1)

for result in res1.pose_landmarks[0]:
    pose_landmarks.append({
        "x": result.x,
        "y": result.y,
        "visibility": result.visibility,
        "presence": result.presence,
    })
print(pose_landmarks)