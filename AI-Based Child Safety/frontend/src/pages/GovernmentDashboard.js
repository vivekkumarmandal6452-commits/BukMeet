import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Baby, Users, TrendingUp, ShieldCheck, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { toast } from 'react-toastify';

const GovernmentDashboard = () => {
  const [stats, setStats] = useState({
    children: { total: 0, safe: 0, highRisk: 0, available: 0, adopted: 0, inProcess: 0 },
    parents: { total: 0, approved: 0, pending: 0, underReview: 0 },
    adoptions: { total: 0, finalized: 0, ongoing: 0 },
    alerts: { total: 0, active: 0, critical: 0 },
    kycReports: 0
  });
  const [adoptionTrends, setAdoptionTrends] = useState([]);
  const [riskTrends, setRiskTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAdoptionTrends();
    fetchRiskTrends();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/government');
      setStats(response.data.data.overview);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdoptionTrends = async () => {
    try {
      const response = await api.get('/dashboard/trends');
      const formattedData = response.data.data.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.total,
        finalized: item.finalized
      }));
      setAdoptionTrends(formattedData);
    } catch (error) {
      console.error('Failed to load adoption trends');
    }
  };

  const fetchRiskTrends = async () => {
    try {
      const response = await api.get('/dashboard/risk-trends');
      const trendMap = {};

      response.data.data.forEach((item) => {
        const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (!trendMap[monthKey]) {
          trendMap[monthKey] = { month: monthKey, Safe: 0, 'Under Review': 0, 'High Risk': 0 };
        }
        trendMap[monthKey][item._id.category] = item.count;
      });

      const formattedTrends = Object.values(trendMap).sort((a, b) => (a.month > b.month ? 1 : -1));
      setRiskTrends(formattedTrends);
    } catch (error) {
      console.error('Failed to load risk trends');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Government Dashboard</h1>
          <p>Analytics and insights for government officials</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard
          title="Total Children"
          value={stats.children.total}
          icon={Baby}
          color="blue"
        />
        <StatCard
          title="Safe Children"
          value={stats.children.safe}
          icon={ShieldCheck}
          color="green"
        />
        <StatCard
          title="High Risk Children"
          value={stats.children.highRisk}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="KYC Reports"
          value={stats.kycReports}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard
          title="Active Alerts"
          value={stats.alerts.active}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Critical Alerts"
          value={stats.alerts.critical}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Approved Parents"
          value={stats.parents.approved}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Finalized Adoptions"
          value={stats.adoptions.finalized}
          icon={TrendingUp}
          color="teal"
        />
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>Adoption Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={adoptionTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#4f46e5" name="Total Adoptions" />
            <Line type="monotone" dataKey="finalized" stroke="#10b981" name="Finalized" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '24px' }}>Risk Trend Overview</h3>
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={riskTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Safe" stroke="#22c55e" name="Safe" />
            <Line type="monotone" dataKey="Under Review" stroke="#f59e0b" name="Under Review" />
            <Line type="monotone" dataKey="High Risk" stroke="#ef4444" name="High Risk" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Children Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Available', value: stats.children.available },
              { name: 'In Process', value: stats.children.inProcess },
              { name: 'Adopted', value: stats.children.adopted }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Parent Applications</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Pending', value: stats.parents.pending },
              { name: 'Under Review', value: stats.parents.underReview },
              { name: 'Approved', value: stats.parents.approved }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
