import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await api.get('/alerts', { params });
      setAlerts(response.data.data);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/status`, {
        status: 'resolved',
        resolutionNotes: 'Resolved by admin'
      });
      toast.success('Alert resolved successfully');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1>Alert System</h1>
          <p>Real-time alerts and notifications</p>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Alerts</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div key={alert._id} className={`card alert-card alert-card-${alert.severity}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {getSeverityIcon(alert.severity)}
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{alert.title}</h3>
                    <span className={`badge badge-${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '12px' }}>{alert.description}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#9ca3af' }}>
                    <span>Category: {alert.category.replace('_', ' ')}</span>
                    <span>Status: {alert.status.replace('_', ' ')}</span>
                    <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {alert.status === 'active' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleResolve(alert._id)}
                    >
                      Resolve
                    </button>
                  )}
                  <button className="btn btn-sm btn-primary">View</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <p className="no-data">No alerts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const getSeverityIcon = (severity) => {
  const iconProps = { size: 20 };
  switch (severity) {
    case 'emergency':
    case 'critical':
      return <AlertTriangle {...iconProps} color="#ef4444" />;
    case 'warning':
      return <AlertCircle {...iconProps} color="#f59e0b" />;
    case 'info':
      return <Info {...iconProps} color="#3b82f6" />;
    default:
      return <Bell {...iconProps} color="#6b7280" />;
  }
};

export default Alerts;
