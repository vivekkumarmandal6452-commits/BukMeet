import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const RiskAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await api.get('/risk-assessment');
      setAssessments(response.data.data);
    } catch (error) {
      toast.error('Failed to load risk assessments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Risk Assessment</h1>
          <p>AI-powered risk analysis for adoptions</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {assessments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Assessment Date</th>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Confidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((assessment) => (
                  <tr key={assessment._id}>
                    <td>{new Date(assessment.assessmentDate).toLocaleDateString()}</td>
                    <td className="capitalize">{assessment.assessmentType.replace('_', ' ')}</td>
                    <td>
                      <span className={`badge badge-${getRiskColor(assessment.aiAnalysis.riskLevel)}`}>
                        <AlertTriangle size={14} style={{ marginRight: '4px' }} />
                        {assessment.aiAnalysis.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{assessment.aiAnalysis.overallRiskScore.toFixed(1)}</strong>/100
                    </td>
                    <td>{assessment.aiAnalysis.predictionConfidence?.toFixed(1) || 'N/A'}%</td>
                    <td>
                      <button className="btn btn-sm btn-primary">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No risk assessments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getRiskColor = (level) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };
  return colors[level] || 'secondary';
};

export default RiskAssessment;
