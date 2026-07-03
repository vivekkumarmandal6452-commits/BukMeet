import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Shield } from "lucide-react";
import "./Register.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    department: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success("Registration Successful");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-header">
          <Shield size={50} />
          <h2>Create Admin Account</h2>
          <p>AI Child Safety Monitoring System</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="Enter Name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter Email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter Password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              name="department"
              className="form-control"
              placeholder="Department"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Role</label>

            <select
              name="role"
              className="form-control"
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
              <option value="government">Government</option>
              <option value="social_worker">Social Worker</option>
            </select>
          </div>

          <button className="btn-register" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>

        <div className="bottom-text">
          Already have an account?

          <Link to="/">
            Login
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Register;