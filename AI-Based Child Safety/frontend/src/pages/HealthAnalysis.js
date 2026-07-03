import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const HealthAnalysis = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const response = await api.post('/health-analysis', { imageBase64: base64 });
        setReport(response.data.data);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Health analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="card">
        <h2>AI Health Analysis</h2>
        <p>Upload a child image to analyze visible injuries, bruises, malnutrition signs, and facial emotions.</p>

        <div className="form-group" style={{ marginTop: '24px' }}>
          <label className="form-label">Upload Image</label>
          <input type="file" accept="image/*" className="form-control" onChange={handleFileSelect} />
        </div>

        {preview && (
          <div style={{ marginTop: '16px' }}>
            <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Health Analysis'}
        </button>
      </div>

      {report && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Health Report</h3>
          <p><strong>Health Score:</strong> {report.health_score}</p>
          <p><strong>Risk Level:</strong> {report.health_risk_level}</p>
          <p><strong>Summary:</strong> {report.summary}</p>

          <h4>Visible Injuries</h4>
          <p>Count: {report.visible_injuries.count}</p>
          <p>Area: {report.visible_injuries.area}</p>

          <h4>Bruises</h4>
          <p>Count: {report.bruises.count}</p>
          <p>Area: {report.bruises.area}</p>

          <h4>Malnutrition</h4>
          <p>Score: {report.malnutrition.score}%</p>
          <p>Indicators: {Object.entries(report.malnutrition.indicators).filter(([_, value]) => value).map(([key]) => key).join(', ') || 'None'}</p>

          <h4>Facial Emotion</h4>
          <p>Emotion: {report.facial_emotion.label}</p>
          <p>Confidence: {report.facial_emotion.confidence}%</p>
        </div>
      )}
    </div>
  );
};

export default HealthAnalysis;
