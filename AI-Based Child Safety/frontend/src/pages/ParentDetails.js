import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ParentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentDetails();
  }, [id]);

  const fetchParentDetails = async () => {
    try {
      const response = await api.get(`/parents/${id}`);
      setParent(response.data.data);
    } catch (error) {
      toast.error('Failed to load parent details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!parent) return <div className="no-data">Parent not found</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="card">
        <h2>Parent Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <strong>Primary Applicant:</strong>
            <p>{parent.primaryApplicant.firstName} {parent.primaryApplicant.lastName}</p>
          </div>
          <div>
            <strong>Email:</strong>
            <p>{parent.primaryApplicant.email}</p>
          </div>
          <div>
            <strong>Phone:</strong>
            <p>{parent.primaryApplicant.phone}</p>
          </div>
          <div>
            <strong>Application Status:</strong>
            <p><span className={`badge badge-${parent.applicationStatus === 'approved' ? 'success' : 'warning'}`}>
              {parent.applicationStatus.replace('_', ' ')}
            </span></p>
          </div>
          <div>
            <strong>KYC Status:</strong>
            <p><span className={`badge ${parent.kycStatus.isVerified ? 'badge-success' : 'badge-warning'}`}>
              {parent.kycStatus.isVerified ? 'Verified' : 'Pending'}
            </span></p>
          </div>
          <div>
            <strong>Next KYC Date:</strong>
            <p>{parent.kycStatus.nextKycDate ? new Date(parent.kycStatus.nextKycDate).toLocaleDateString() : 'Not scheduled'}</p>
          </div>
          <div>
            <strong>Address:</strong>
            <p>{parent.address.street}, {parent.address.city}, {parent.address.state}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDetails;
