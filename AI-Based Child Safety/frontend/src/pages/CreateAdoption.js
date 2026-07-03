import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const CreateAdoption = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [formData, setFormData] = useState({
    child: '',
    parent: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [childrenRes, parentsRes] = await Promise.all([
        api.get('/children?status=available'),
        api.get('/parents?status=approved')
      ]);
      setChildren(childrenRes.data.data);
      setParents(parentsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/adoptions', {
        child: formData.child,
        parents: [formData.parent]
      });
      toast.success('Adoption created successfully');
      navigate('/adoptions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create adoption');
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
        <h2>Create New Adoption Record</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '24px', maxWidth: '600px' }}>
          <div className="form-group">
            <label className="form-label">Select Child *</label>
            <select
              className="form-select"
              value={formData.child}
              onChange={(e) => setFormData({ ...formData, child: e.target.value })}
              required
            >
              <option value="">Choose a child...</option>
              {children.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.firstName} {child.lastName} - Age {calculateAge(child.dateOfBirth)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Parent *</label>
            <select
              className="form-select"
              value={formData.parent}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              required
            >
              <option value="">Choose a parent...</option>
              {parents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.primaryApplicant.firstName} {parent.primaryApplicant.lastName} - {parent.address.city}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Adoption'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  return Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
};

export default CreateAdoption;
