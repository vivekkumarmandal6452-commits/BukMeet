import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchParents();
  }, [statusFilter]);

  const fetchParents = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/parents', { params });
      setParents(response.data.data);
    } catch (error) {
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const filteredParents = parents.filter(parent =>
    `${parent.primaryApplicant.firstName} ${parent.primaryApplicant.lastName}`
      .toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="parents-page">
      <div className="page-header">
        <div>
          <h1>Parent Management</h1>
          <p>Manage prospective adoptive parents</p>
        </div>
        <Link to="/parents/add" className="btn btn-primary">
          <Plus size={18} />
          <span>Add Parent</span>
        </Link>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={18} />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {filteredParents.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Parent ID</th>
                  <th>Name</th>
                  <th>Aadhaar</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Occupation</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={parent._id}>
                    <td>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        color: '#7c3aed',
                        backgroundColor: '#f5f3ff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        {parent.parentId || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {parent.primaryApplicant.firstName} {parent.primaryApplicant.lastName}
                      </strong>
                      {parent.applicationType === 'couple' && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          & {parent.secondaryApplicant?.firstName} {parent.secondaryApplicant?.lastName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {parent.primaryApplicant.aadhaarNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3') || 'N/A'}
                      </span>
                    </td>
                    <td>{parent.primaryApplicant.phone}</td>
                    <td>{parent.address.city}</td>
                    <td>{parent.primaryApplicant.occupation}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(parent.applicationStatus)}`}>
                        {parent.applicationStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/parents/${parent._id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No parents found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    under_review: 'info',
    approved: 'success',
    rejected: 'danger',
    on_hold: 'secondary'
  };
  return colors[status] || 'secondary';
};

export default Parents;
