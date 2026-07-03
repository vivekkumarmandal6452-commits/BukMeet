import argparse
import json
import os
import cv2
import numpy as np


def load_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Unable to load image')
    return image


def detect_skin_mask(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower = np.array([0, 30, 60], dtype=np.uint8)
    upper = np.array([20, 150, 255], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower, upper)
    return mask


def detect_bruises(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_blue = np.array([90, 40, 20], dtype=np.uint8)
    upper_blue = np.array([140, 255, 255], dtype=np.uint8)
    blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)

    lower_purple = np.array([130, 40, 20], dtype=np.uint8)
    upper_purple = np.array([160, 255, 255], dtype=np.uint8)
    purple_mask = cv2.inRange(hsv, lower_purple, upper_purple)

    bruise_mask = cv2.bitwise_or(blue_mask, purple_mask)
    cnts, _ = cv2.findContours(bruise_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    bruises = [cv2.contourArea(c) for c in cnts if cv2.contourArea(c) > 150]

    return len(bruises), sum(bruises)


def detect_injuries(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_red1 = np.array([0, 40, 40], dtype=np.uint8)
    upper_red1 = np.array([10, 255, 255], dtype=np.uint8)
    lower_red2 = np.array([160, 40, 40], dtype=np.uint8)
    upper_red2 = np.array([180, 255, 255], dtype=np.uint8)
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    red_mask = cv2.bitwise_or(mask1, mask2)

    cnts, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    injuries = [cv2.contourArea(c) for c in cnts if cv2.contourArea(c) > 100]

    return len(injuries), sum(injuries)


def analyze_malnutrition(image):
    blur = cv2.GaussianBlur(image, (7, 7), 0)
    lab = cv2.cvtColor(blur, cv2.COLOR_BGR2LAB)
    l_channel = lab[:, :, 0]
    avg_lightness = float(np.mean(l_channel))
    sat = cv2.cvtColor(blur, cv2.COLOR_BGR2HSV)[:, :, 1]
    avg_saturation = float(np.mean(sat))

    malnutrition_score = 0
    if avg_lightness < 90:
        malnutrition_score += 0.4
    if avg_saturation < 45:
        malnutrition_score += 0.4
    if avg_lightness < 70:
        malnutrition_score += 0.2

    malnutrition_score = min(max(malnutrition_score, 0.0), 1.0)
    indicators = {
        'pale_skin': avg_lightness < 90,
        'low_saturation': avg_saturation < 45,
        'possible_wasting': avg_lightness < 70
    }
    return malnutrition_score, indicators


def detect_face_emotions(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

    if len(faces) == 0:
        return 'unknown', 0.0

    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]
    mouth_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_mcs_mouth.xml') if os.path.exists(cv2.data.haarcascades + 'haarcascade_mcs_mouth.xml') else None
    eyes_detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    mouth_open = False
    if mouth_detector is not None:
        mouths = mouth_detector.detectMultiScale(face, scaleFactor=1.1, minNeighbors=15)
        mouth_open = len(mouths) > 0

    eyes = eyes_detector.detectMultiScale(face, scaleFactor=1.1, minNeighbors=10)
    emotion = 'neutral'
    confidence = 0.5
    if mouth_open and len(eyes) > 0:
        emotion = 'surprised'
        confidence = 0.85
    elif len(eyes) > 0 and not mouth_open:
        emotion = 'calm'
        confidence = 0.7
    else:
        emotion = 'neutral'
        confidence = 0.55

    return emotion, confidence


def calculate_health_score(injury_count, bruise_count, malnutrition_score, emotion):
    penalty = injury_count * 10 + bruise_count * 7 + malnutrition_score * 30
    emotion_penalty = 0
    if emotion in ('sad', 'concerned'):
        emotion_penalty = 10
    if emotion == 'surprised':
        emotion_penalty = 5
    total = max(0, 100 - penalty - emotion_penalty)
    return round(total, 1)


def build_report(injuries, bruises, malnutrition, emotion, score):
    risk_level = 'low'
    if score < 40:
        risk_level = 'critical'
    elif score < 60:
        risk_level = 'high'
    elif score < 80:
        risk_level = 'moderate'

    return {
        'visible_injuries': {
            'count': injuries[0],
            'area': injuries[1]
        },
        'bruises': {
            'count': bruises[0],
            'area': bruises[1]
        },
        'malnutrition': {
            'score': round(malnutrition[0] * 100, 1),
            'indicators': malnutrition[1]
        },
        'facial_emotion': {
            'label': emotion[0],
            'confidence': round(emotion[1] * 100, 1)
        },
        'health_score': score,
        'health_risk_level': risk_level,
        'summary': f'Health score {score}. Detected {injuries[0]} visible injury areas, {bruises[0]} potential bruises, malnutrition likelihood {round(malnutrition[0] * 100, 1)}%.'
    }


def main():
    parser = argparse.ArgumentParser(description='Analyze child health from image')
    parser.add_argument('--image', required=True, help='Path to input image file')
    args = parser.parse_args()

    image_path = args.image
    image = load_image(image_path)

    injuries = detect_injuries(image)
    bruises = detect_bruises(image)
    malnutrition = analyze_malnutrition(image)
    emotion = detect_face_emotions(image)
    score = calculate_health_score(injuries, bruises, malnutrition[0], emotion[0])
    report = build_report(injuries, bruises, malnutrition, emotion, score)

    print(json.dumps(report))


if __name__ == '__main__':
    main()
