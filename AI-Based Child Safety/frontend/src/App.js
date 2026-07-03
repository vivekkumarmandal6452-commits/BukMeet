import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Register from "./pages/Register";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import ChildDetails from './pages/ChildDetails';
import AddChild from './pages/AddChild';
import Parents from './pages/Parents';
import ParentDetails from './pages/ParentDetails';
import AddParent from './pages/AddParent';
import Adoptions from './pages/Adoptions';
import AdoptionDetails from './pages/AdoptionDetails';
import CreateAdoption from './pages/CreateAdoption';
import RiskAssessment from './pages/RiskAssessment';
import Alerts from './pages/Alerts';
import HealthAnalysis from './pages/HealthAnalysis';
import Questionnaire from './pages/Questionnaire';
import GovernmentDashboard from './pages/GovernmentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
<Routes>

  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Private Routes */}
  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>

    <Route index element={<Navigate to="/dashboard" replace />} />

    <Route path="dashboard" element={<Dashboard />} />

    <Route path="children" element={<Children />} />
    <Route path="children/add" element={<AddChild />} />
    <Route path="children/:id" element={<ChildDetails />} />

    <Route path="parents" element={<Parents />} />
    <Route path="parents/add" element={<AddParent />} />
    <Route path="parents/:id" element={<ParentDetails />} />

    <Route path="adoptions" element={<Adoptions />} />
    <Route path="adoptions/create" element={<CreateAdoption />} />
    <Route path="adoptions/:id" element={<AdoptionDetails />} />

    <Route path="risk-assessment" element={<RiskAssessment />} />
    <Route path="health-analysis" element={<HealthAnalysis />} />
    <Route path="children/:id/questionnaire" element={<Questionnaire />} />
    <Route path="alerts" element={<Alerts />} />
    <Route path="government" element={<GovernmentDashboard />} />

  </Route>

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/login" replace />} />

</Routes>
        
      </Router>
    </AuthProvider>
  );
}

export default App;
