import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Baby, Heart, 
  AlertTriangle, BarChart3, Menu, X, LogOut, UploadCloud 
} from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/children', icon: Baby, label: 'Children' },
    { path: '/parents', icon: Users, label: 'Parents' },
    { path: '/adoptions', icon: Heart, label: 'Adoptions' },
    { path: '/risk-assessment', icon: AlertTriangle, label: 'Risk Assessment' },
    { path: '/health-analysis', icon: UploadCloud, label: 'Health Analysis' },
    { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
    { path: '/government', icon: BarChart3, label: 'Government Dashboard' }
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Child Safety System</h2>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header">
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
