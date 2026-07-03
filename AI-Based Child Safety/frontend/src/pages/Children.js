import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Children.css';

const Children = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchChildren();
  }, [statusFilter]);

  const fetchChildren = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/children', { params });
      setChildren(response.data.data);
    } catch (error) {
      toast.error('Failed to load children');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children.filter(child =>
    `${child.firstName} ${child.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="children-page">
      <div className="page-header">
        <div>
          <h1>Children Management</h1>
          <p>Manage and track child registrations</p>
        </div>
        <Link to="/children/add" className="btn btn-primary">
          <Plus size={18} />
          <span>Add Child</span>
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
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="in_process">In Process</option>
            <option value="adopted">Adopted</option>
            <option value="foster_care">Foster Care</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {filteredChildren.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Child ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map((child) => (
                  <tr key={child._id}>
                    <td>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontWeight: 'bold',
                        color: '#2563eb',
                        backgroundColor: '#eff6ff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        {child.childId || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <strong>{child.firstName} {child.lastName}</strong>
                    </td>
                    <td>{calculateAge(child.dateOfBirth)} years</td>
                    <td className="capitalize">{child.gender}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(child.currentStatus)}`}>
                        {child.currentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{child.currentLocation?.city || 'N/A'}</td>
                    <td>{new Date(child.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/children/${child._id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No children found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const getStatusColor = (status) => {
  const colors = {
    available: 'success',
    in_process: 'warning',
    adopted: 'info',
    foster_care: 'secondary'
  };
  return colors[status] || 'secondary';
};

export default Children;
