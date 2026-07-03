import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Adoptions = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdoptions();
  }, [statusFilter]);

  const filteredAdoptions = adoptions.filter((adoption) => {
    const query = searchTerm.toLowerCase();
    return (
      adoption.adoptionId?.toLowerCase().includes(query) ||
      `${adoption.child?.firstName || ''} ${adoption.child?.lastName || ''}`.toLowerCase().includes(query) ||
      `${adoption.parents?.[0]?.primaryApplicant?.firstName || ''} ${adoption.parents?.[0]?.primaryApplicant?.lastName || ''}`.toLowerCase().includes(query)
    );
  });

  const fetchAdoptions = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/adoptions', { params });
      setAdoptions(response.data.data);
    } catch (error) {
      toast.error('Failed to load adoptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="adoptions-page">
      <div className="page-header">
        <div>
          <h1>Adoption Records</h1>
          <p>Manage and track adoption processes</p>
        </div>
        <Link to="/adoptions/create" className="btn btn-primary">
          <Plus size={18} />
          <span>Create Adoption</span>
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="initiated">Initiated</option>
            <option value="under_review">Under Review</option>
            <option value="trial_period">Trial Period</option>
            <option value="finalized">Finalized</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {filteredAdoptions.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Adoption ID</th>
                  <th>Child Name</th>
                  <th>Parent Name</th>
                  <th>Status</th>
                  <th>Application Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdoptions.map((adoption) => (
                  <tr key={adoption._id}>
                    <td>
                      <span className="adoption-id">
                        {adoption.adoptionId || adoption._id}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {adoption.child?.firstName} {adoption.child?.lastName}
                      </strong>
                    </td>
                    <td>
                      {adoption.parents?.[0]?.primaryApplicant?.firstName}{' '}
                      {adoption.parents?.[0]?.primaryApplicant?.lastName}
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusColor(adoption.status)}`}>
                        {adoption.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(adoption.applicationDate).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/adoptions/${adoption._id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No adoptions found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    initiated: 'info',
    documents_pending: 'warning',
    under_review: 'warning',
    legal_process: 'info',
    trial_period: 'warning',
    finalized: 'success',
    rejected: 'danger',
    cancelled: 'secondary'
  };
  return colors[status] || 'secondary';
};

export default Adoptions;
