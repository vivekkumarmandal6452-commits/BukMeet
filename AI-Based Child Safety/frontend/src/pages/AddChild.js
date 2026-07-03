import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Save } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AddChild = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    photo: '',
    adoptionDate: '',
    medicalHistory: {
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      disabilities: '',
      notes: ''
    },
    currentStatus: 'available',
    currentLocation: {
      facilityName: '',
      city: '',
      state: '',
      contactPerson: '',
      contactNumber: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process medical history - convert comma-separated strings to arrays
      const processedData = {
        ...formData,
        medicalHistory: {
          bloodGroup: formData.medicalHistory.bloodGroup,
          allergies: formData.medicalHistory.allergies 
            ? formData.medicalHistory.allergies.split(',').map(item => item.trim()).filter(item => item)
            : [],
          chronicConditions: formData.medicalHistory.chronicConditions
            ? formData.medicalHistory.chronicConditions.split(',').map(item => item.trim()).filter(item => item)
            : [],
          disabilities: formData.medicalHistory.disabilities
            ? formData.medicalHistory.disabilities.split(',').map(item => item.trim()).filter(item => item)
            : []
        }
      };

      const response = await api.post('/children', processedData);
      toast.success(`Child registered successfully! Child ID: ${response.data.data.childId}`);
      navigate('/children');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/children')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Register New Child</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            A unique Child ID will be auto-generated upon registration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Basic Information</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                className="form-control"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Adoption Date</label>
              <input
                type="date"
                name="adoptionDate"
                className="form-control"
                value={formData.adoptionDate}
                onChange={handleChange}
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Leave blank if not yet adopted</small>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Child Photograph</label>
            <div style={{ 
              border: '2px dashed #ddd', 
              borderRadius: '8px', 
              padding: '30px', 
              textAlign: 'center',
              backgroundColor: '#f9fafb'
            }}>
              {photoPreview ? (
                <div>
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      marginBottom: '10px'
                    }} 
                  />
                  <br />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photo: '' }));
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '10px' }}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div>
                  <User size={64} style={{ color: '#ccc', marginBottom: '10px' }} />
                  <p style={{ color: '#666', margin: '10px 0', fontSize: '14px' }}>
                    Upload child photograph (JPG, PNG - Max 5MB)
                  </p>
                  <label htmlFor="photo-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Choose Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Medical History</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="medicalHistory.bloodGroup"
                className="form-control"
                value={formData.medicalHistory.bloodGroup}
                onChange={handleNestedChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Allergies</label>
            <input
              type="text"
              name="medicalHistory.allergies"
              className="form-control"
              value={formData.medicalHistory.allergies}
              onChange={handleNestedChange}
              placeholder="e.g., Peanuts, Dust, Pollen"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Enter multiple items separated by commas</small>
          </div>

          <div className="form-group">
            <label className="form-label">Chronic Conditions</label>
            <input
              type="text"
              name="medicalHistory.chronicConditions"
              className="form-control"
              value={formData.medicalHistory.chronicConditions}
              onChange={handleNestedChange}
              placeholder="e.g., Asthma, Diabetes"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Enter multiple items separated by commas</small>
          </div>

          <div className="form-group">
            <label className="form-label">Disabilities</label>
            <input
              type="text"
              name="medicalHistory.disabilities"
              className="form-control"
              value={formData.medicalHistory.disabilities}
              onChange={handleNestedChange}
              placeholder="e.g., Visual impairment, Hearing loss"
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Enter multiple items separated by commas</small>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Medical Notes</label>
            <textarea
              name="medicalHistory.notes"
              className="form-control"
              value={formData.medicalHistory.notes}
              onChange={handleNestedChange}
              rows="3"
              placeholder="Any additional medical information..."
            />
          </div>
        </div>

        {/* Current Location */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Current Location</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Facility Name</label>
              <input
                type="text"
                name="currentLocation.facilityName"
                className="form-control"
                value={formData.currentLocation.facilityName}
                onChange={handleNestedChange}
                placeholder="e.g., City Children's Home"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="currentLocation.city"
                className="form-control"
                value={formData.currentLocation.city}
                onChange={handleNestedChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="currentLocation.state"
                className="form-control"
                value={formData.currentLocation.state}
                onChange={handleNestedChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                name="currentLocation.contactPerson"
                className="form-control"
                value={formData.currentLocation.contactPerson}
                onChange={handleNestedChange}
                placeholder="Facility manager name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="currentLocation.contactNumber"
                className="form-control"
                value={formData.currentLocation.contactNumber}
                onChange={handleNestedChange}
                placeholder="Phone number"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/children')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            <Save size={18} />
            <span>{loading ? 'Registering...' : 'Register Child'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddChild;
