import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import FaceRecognition from '../components/FaceRecognition';

const ChildDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildDetails();
  }, [id]);

  const fetchChildDetails = async () => {
    try {
      const response = await api.get(`/children/${id}`);
      setChild(response.data.data);
    } catch (error) {
      toast.error('Failed to load child details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!child) {
    return <div className="no-data">Child not found</div>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="card">
        <h2>{child.firstName} {child.lastName}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <strong>Date of Birth:</strong>
            <p>{new Date(child.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div>
            <strong>Gender:</strong>
            <p className="capitalize">{child.gender}</p>
          </div>
          <div>
            <strong>Status:</strong>
            <p><span className={`badge badge-${child.currentStatus === 'available' ? 'success' : 'info'}`}>
              {child.currentStatus.replace('_', ' ')}
            </span></p>
          </div>
          <div>
            <strong>Current Location:</strong>
            <p>{child.currentLocation?.facilityName || 'N/A'}</p>
            <p>{child.currentLocation?.city}, {child.currentLocation?.state}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/children/${id}/questionnaire`)}
        >
          Start Interactive Questionnaire
        </button>
      </div>

      <FaceRecognition childId={child._id} registeredPhoto={child.photo} />
    </div>
  );
};

export default ChildDetails;
