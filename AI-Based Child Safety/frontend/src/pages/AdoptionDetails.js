import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const statusOptions = [
  'initiated',
  'documents_pending',
  'under_review',
  'legal_process',
  'trial_period',
  'finalized',
  'rejected',
  'cancelled'
];

const AdoptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusValue, setStatusValue] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('Birth Certificate');
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAdoptionDetails();
  }, [id]);

  useEffect(() => {
    if (adoption) {
      setStatusValue(adoption.status);
    }
  }, [adoption]);

  const fetchAdoptionDetails = async () => {
    try {
      const response = await api.get(`/adoptions/${id}`);
      setAdoption(response.data.data);
    } catch (error) {
      toast.error('Failed to load adoption details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/adoptions/${id}/status`, {
        status: statusValue,
        notes: statusNotes
      });
      setAdoption(response.data.data);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!documentName || !documentType || !documentFile) {
      toast.error('Complete all document fields');
      return;
    }

    const formData = new FormData();
    formData.append('documentName', documentName);
    formData.append('documentType', documentType);
    formData.append('document', documentFile);

    setUploading(true);
    try {
      const response = await api.post(`/adoptions/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAdoption(response.data.data);
      setDocumentName('');
      setDocumentType('Birth Certificate');
      setDocumentFile(null);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this adoption record? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/adoptions/${id}`);
      toast.success('Adoption deleted successfully');
      navigate('/adoptions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete adoption');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!adoption) return <div className="no-data">Adoption not found</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div>
            <h2>Adoption Details</h2>
            <p style={{ color: '#4b5563' }}><strong>Adoption ID:</strong> {adoption.adoptionId || adoption._id}</p>
          </div>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Adoption
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <strong>Child:</strong>
            <p>{adoption.child?.firstName} {adoption.child?.lastName}</p>
          </div>
          <div>
            <strong>Adoptive Parents:</strong>
            <p>
              {adoption.parents?.length > 0 ? adoption.parents.map((parent, index) => (
                <span key={parent._id}>
                  {parent.primaryApplicant?.firstName} {parent.primaryApplicant?.lastName}{index < adoption.parents.length - 1 ? ', ' : ''}
                </span>
              )) : 'N/A'}
            </p>
          </div>
          <div>
            <strong>Status:</strong>
            <p><span className={`badge badge-${adoption.status === 'finalized' ? 'success' : 'info'}`}>
              {adoption.status.replace('_', ' ')}
            </span></p>
          </div>
          <div>
            <strong>Application Date:</strong>
            <p>{new Date(adoption.applicationDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Update Adoption Status</h3>
        <form onSubmit={handleStatusUpdate} style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select
              className="form-select"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes for this status update"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Update Status
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Upload Adoption Document</h3>
        <form onSubmit={handleDocumentUpload} style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">Document Name</label>
            <input
              type="text"
              className="form-control"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. Adoption Deed"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option>Birth Certificate</option>
              <option>Adoption Deed</option>
              <option>Court Order</option>
              <option>Home Study Report</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Upload File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
              accept="application/pdf,image/*"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Legal Documents</h3>
        {adoption.legalDocuments?.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {adoption.legalDocuments.map((doc) => (
                  <tr key={doc._id || doc.uploadDate}>
                    <td>{doc.documentName}</td>
                    <td>{doc.documentType}</td>
                    <td>{doc.verificationStatus}</td>
                    <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdoptionDetails;
