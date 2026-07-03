import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import api from '../services/api';
import { toast } from 'react-toastify';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

const FaceRecognition = ({ childId, registeredPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
      } catch (error) {
        toast.error('Failed to load face recognition models');
        console.error(error);
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
    const video = videoRef.current;
    return () => {
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (streaming) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStreaming(true);
    } catch (error) {
      toast.error('Unable to access webcam');
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const captureImage = async () => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const verifyFace = async () => {
    if (loadingModels) {
      toast.info('Models are still loading');
      return;
    }

    const imageData = await captureImage();
    if (!imageData) {
      toast.error('Unable to capture image');
      return;
    }

    try {
      const capturedImg = await faceapi.fetchImage(imageData);
      const registeredImg = await faceapi.fetchImage(registeredPhoto || imageData);

      const detectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
      const capturedResults = await faceapi.detectSingleFace(capturedImg, detectionOptions).withFaceLandmarks().withFaceDescriptor();
      const registeredResults = await faceapi.detectSingleFace(registeredImg, detectionOptions).withFaceLandmarks().withFaceDescriptor();

      if (!capturedResults || !registeredResults) {
        toast.error('Face not detected in one of the images');
        return;
      }

      const distance = faceapi.euclideanDistance(capturedResults.descriptor, registeredResults.descriptor);
      const identityScore = Math.max(0, 100 - distance * 100).toFixed(1);
      const verified = distance < 0.6;

      const liveCheck = await performLivenessCheck(capturedImg);
      setVerificationResult({ distance, verified, identityScore, livenessPass: liveCheck });

      await api.post(`/children/${childId}/verification`, {
        verification: {
          score: Number(identityScore),
          distance,
          livenessDetected: liveCheck,
          verified,
          notes: liveCheck ? 'Liveness confirmed' : 'Suspected spoofing',
          verifiedBy: 'webcam-face-recognition'
        }
      });

      toast.success(`Verification ${verified ? 'successful' : 'failed'} (score ${identityScore})`);
    } catch (error) {
      toast.error('Face verification failed');
      console.error(error);
    }
  };

  const performLivenessCheck = async (image) => {
    const detection = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions());
    if (!detection) return false;
    const landmarks = await faceapi.detectFaceLandmarks(image); 
    return !!landmarks;
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h3>Face Recognition</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <strong>Registered Image</strong>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
            {registeredPhoto ? (
              <img src={registeredPhoto} alt="Registered" style={{ width: '100%', borderRadius: '8px' }} />
            ) : (
              <p>No registered photo available.</p>
            )}
          </div>
        </div>

        <div>
          <strong>Live Capture</strong>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '16px', marginTop: '12px' }}>
            <video ref={videoRef} style={{ width: '100%', borderRadius: '8px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-primary" onClick={startCamera} disabled={streaming}>
                Start Camera
              </button>
              <button type="button" className="btn btn-secondary" onClick={stopCamera} disabled={!streaming}>
                Stop Camera
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <button type="button" className="btn btn-primary" onClick={verifyFace} disabled={!streaming || loadingModels}>
          Verify Identity
        </button>
      </div>

      {verificationResult && (
        <div style={{ marginTop: '20px' }}>
          <h4>Verification Report</h4>
          <p><strong>Identity Score:</strong> {verificationResult.identityScore}%</p>
          <p><strong>Distance:</strong> {verificationResult.distance.toFixed(4)}</p>
          <p><strong>Liveness Detected:</strong> {verificationResult.livenessPass ? 'Yes' : 'No'}</p>
          <p><strong>Verified:</strong> {verificationResult.verified ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
