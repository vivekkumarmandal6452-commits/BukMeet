import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Baby, Users, Heart, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    children: { total: 0, available: 0, adopted: 0, inProcess: 0 },
    parents: { total: 0, approved: 0, pending: 0 },
    adoptions: { total: 0, finalized: 0, ongoing: 0 },
    alerts: { active: 0, critical: 0 }
  });
  const [recentAdoptions, setRecentAdoptions] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/government');
      const data = response.data.data;
      
      setStats(data.overview);
      setRecentAdoptions(data.recentActivities.adoptions);
      setRecentAlerts(data.recentActivities.alerts);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to the Child Safety & Post-Adoption Monitoring System</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Children"
          value={stats.children.total}
          icon={Baby}
          color="blue"
        />
        <StatCard
          title="Available for Adoption"
          value={stats.children.available}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Total Parents"
          value={stats.parents.total}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Approved Parents"
          value={stats.parents.approved}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Adoptions"
          value={stats.adoptions.total}
          icon={Heart}
          color="yellow"
        />
        <StatCard
          title="Active Alerts"
          value={stats.alerts.active}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Finalized Adoptions</span>
          <span className="stat-number">{stats.adoptions.finalized}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ongoing Adoptions</span>
          <span className="stat-number">{stats.adoptions.ongoing}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending Parents</span>
          <span className="stat-number">{stats.parents.pending}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Critical Alerts</span>
          <span className="stat-number critical">{stats.alerts.critical}</span>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities-section">
        <div className="card">
          <div className="card-header">
            <h3>Recent Adoptions</h3>
            <Link to="/adoptions" className="btn btn-sm btn-primary">View All</Link>
          </div>
          <div className="table-container">
            {recentAdoptions.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Child Name</th>
                    <th>Parent Name</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdoptions.map((adoption) => (
                    <tr key={adoption._id}>
                      <td>
                        {adoption.child?.firstName} {adoption.child?.lastName}
                      </td>
                      <td>
                        {adoption.parent?.primaryApplicant?.firstName}{' '}
                        {adoption.parent?.primaryApplicant?.lastName}
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(adoption.status)}`}>
                          {adoption.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(adoption.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No recent adoptions</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Active Alerts</h3>
            <Link to="/alerts" className="btn btn-sm btn-danger">View All</Link>
          </div>
          <div className="alerts-list">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div key={alert._id} className={`alert-item alert-${alert.severity}`}>
                  <div className="alert-content">
                    <h4>{alert.title}</h4>
                    <p>{alert.description}</p>
                    <span className="alert-time">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className={`badge badge-${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-data">No active alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    initiated: 'info',
    under_review: 'warning',
    trial_period: 'warning',
    finalized: 'success',
    rejected: 'danger',
    cancelled: 'secondary'
  };
  return colors[status] || 'info';
};

export default Dashboard;
