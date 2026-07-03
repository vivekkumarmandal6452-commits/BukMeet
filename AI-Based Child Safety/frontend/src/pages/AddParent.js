import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Save, Users } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AddParent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [primaryPhotoPreview, setPrimaryPhotoPreview] = useState(null);
  const [secondaryPhotoPreview, setSecondaryPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    applicationType: 'single',
    primaryApplicant: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      aadhaarNumber: '',
      occupation: '',
      annualIncome: '',
      education: '',
      phone: '',
      email: '',
      photo: ''
    },
    secondaryApplicant: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      aadhaarNumber: '',
      occupation: '',
      annualIncome: '',
      education: '',
      phone: '',
      email: '',
      photo: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      residenceType: 'owned',
      yearsAtResidence: ''
    },
    preferences: {
      ageRange: {
        min: '',
        max: ''
      },
      gender: 'any',
      specialNeeds: false,
      siblings: false
    },
    motivation: {
      reasonForAdoption: '',
      experienceWithChildren: '',
      parentingStyle: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDoubleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoChange = (e, applicantType) => {
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
        if (applicantType === 'primary') {
          setPrimaryPhotoPreview(reader.result);
          handleNestedChange('primaryApplicant', 'photo', reader.result);
        } else {
          setSecondaryPhotoPreview(reader.result);
          handleNestedChange('secondaryApplicant', 'photo', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process data
      const processedData = {
        ...formData,
        primaryApplicant: {
          ...formData.primaryApplicant,
          annualIncome: parseFloat(formData.primaryApplicant.annualIncome) || 0
        },
        secondaryApplicant: formData.applicationType === 'couple' ? {
          ...formData.secondaryApplicant,
          annualIncome: parseFloat(formData.secondaryApplicant.annualIncome) || 0
        } : undefined,
        address: {
          ...formData.address,
          yearsAtResidence: parseInt(formData.address.yearsAtResidence) || 0
        },
        preferences: {
          ...formData.preferences,
          ageRange: {
            min: parseInt(formData.preferences.ageRange.min) || 0,
            max: parseInt(formData.preferences.ageRange.max) || 18
          }
        }
      };

      const response = await api.post('/parents', processedData);
      toast.success(`Parent registered successfully! Parent ID: ${response.data.data.parentId}`);
      navigate('/parents');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register parent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/parents')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Register Adoptive Parent</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
            A unique Parent ID will be auto-generated upon registration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Application Type */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Application Type</h2>
          
          <div className="form-group">
            <label className="form-label">Applicant Type *</label>
            <select
              name="applicationType"
              className="form-control"
              value={formData.applicationType}
              onChange={handleChange}
              required
            >
              <option value="single">Single Parent</option>
              <option value="couple">Couple</option>
            </select>
          </div>
        </div>

        {/* Primary Applicant */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={24} />
            Primary Applicant Details
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.primaryApplicant.firstName}
                onChange={(e) => handleNestedChange('primaryApplicant', 'firstName', e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.primaryApplicant.lastName}
                onChange={(e) => handleNestedChange('primaryApplicant', 'lastName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className="form-control"
                value={formData.primaryApplicant.dateOfBirth}
                onChange={(e) => handleNestedChange('primaryApplicant', 'dateOfBirth', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-control"
                value={formData.primaryApplicant.gender}
                onChange={(e) => handleNestedChange('primaryApplicant', 'gender', e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Aadhaar Number *</label>
              <input
                type="text"
                className="form-control"
                value={formData.primaryApplicant.aadhaarNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                  handleNestedChange('primaryApplicant', 'aadhaarNumber', value);
                }}
                placeholder="12-digit Aadhaar"
                maxLength="12"
                required
              />
              <small style={{ color: '#666', fontSize: '12px' }}>12-digit Aadhaar number</small>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.primaryApplicant.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleNestedChange('primaryApplicant', 'phone', value);
                }}
                placeholder="10-digit mobile"
                maxLength="10"
                required
              />
              <small style={{ color: '#666', fontSize: '12px' }}>10-digit mobile number</small>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-control"
                value={formData.primaryApplicant.email}
                onChange={(e) => handleNestedChange('primaryApplicant', 'email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Occupation *</label>
              <input
                type="text"
                className="form-control"
                value={formData.primaryApplicant.occupation}
                onChange={(e) => handleNestedChange('primaryApplicant', 'occupation', e.target.value)}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Income (₹) *</label>
              <input
                type="number"
                className="form-control"
                value={formData.primaryApplicant.annualIncome}
                onChange={(e) => handleNestedChange('primaryApplicant', 'annualIncome', e.target.value)}
                placeholder="Annual income in rupees"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education</label>
              <input
                type="text"
                className="form-control"
                value={formData.primaryApplicant.education}
                onChange={(e) => handleNestedChange('primaryApplicant', 'education', e.target.value)}
                placeholder="Highest qualification"
              />
            </div>
          </div>

          {/* Primary Applicant Photo */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Photograph</label>
            <div style={{ 
              border: '2px dashed #ddd', 
              borderRadius: '8px', 
              padding: '30px', 
              textAlign: 'center',
              backgroundColor: '#f9fafb'
            }}>
              {primaryPhotoPreview ? (
                <div>
                  <img 
                    src={primaryPhotoPreview} 
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
                      setPrimaryPhotoPreview(null);
                      handleNestedChange('primaryApplicant', 'photo', '');
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
                    Upload photograph (JPG, PNG - Max 5MB)
                  </p>
                  <label htmlFor="primary-photo-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Choose Photo
                  </label>
                  <input
                    id="primary-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e, 'primary')}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Applicant (for couples) */}
        {formData.applicationType === 'couple' && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={24} />
              Secondary Applicant Details (Spouse)
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.secondaryApplicant.firstName}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'firstName', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.secondaryApplicant.lastName}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'lastName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.secondaryApplicant.dateOfBirth}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={formData.secondaryApplicant.gender}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.secondaryApplicant.aadhaarNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    handleNestedChange('secondaryApplicant', 'aadhaarNumber', value);
                  }}
                  placeholder="12-digit Aadhaar"
                  maxLength="12"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.secondaryApplicant.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleNestedChange('secondaryApplicant', 'phone', value);
                  }}
                  placeholder="10-digit mobile"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.secondaryApplicant.email}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'email', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.secondaryApplicant.occupation}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'occupation', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Income (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.secondaryApplicant.annualIncome}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'annualIncome', e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.secondaryApplicant.education}
                  onChange={(e) => handleNestedChange('secondaryApplicant', 'education', e.target.value)}
                />
              </div>
            </div>

            {/* Secondary Applicant Photo */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Photograph</label>
              <div style={{ 
                border: '2px dashed #ddd', 
                borderRadius: '8px', 
                padding: '30px', 
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                {secondaryPhotoPreview ? (
                  <div>
                    <img 
                      src={secondaryPhotoPreview} 
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
                        setSecondaryPhotoPreview(null);
                        handleNestedChange('secondaryApplicant', 'photo', '');
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
                      Upload photograph (JPG, PNG - Max 5MB)
                    </p>
                    <label htmlFor="secondary-photo-upload" className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                      <Upload size={16} style={{ marginRight: '8px' }} />
                      Choose Photo
                    </label>
                    <input
                      id="secondary-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, 'secondary')}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Address Details</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-control"
                value={formData.address.street}
                onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                placeholder="House/Flat No., Street Name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                value={formData.address.city}
                onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-control"
                value={formData.address.state}
                onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">ZIP Code *</label>
              <input
                type="text"
                className="form-control"
                value={formData.address.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  handleNestedChange('address', 'zipCode', value);
                }}
                placeholder="6-digit PIN"
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Residence Type</label>
              <select
                className="form-control"
                value={formData.address.residenceType}
                onChange={(e) => handleNestedChange('address', 'residenceType', e.target.value)}
              >
                <option value="owned">Owned</option>
                <option value="rented">Rented</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years at Residence</label>
              <input
                type="number"
                className="form-control"
                value={formData.address.yearsAtResidence}
                onChange={(e) => handleNestedChange('address', 'yearsAtResidence', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Adoption Preferences */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Adoption Preferences</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Preferred Child Age (Min)</label>
              <input
                type="number"
                className="form-control"
                value={formData.preferences.ageRange.min}
                onChange={(e) => handleDoubleNestedChange('preferences', 'ageRange', 'min', e.target.value)}
                min="0"
                max="18"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Child Age (Max)</label>
              <input
                type="number"
                className="form-control"
                value={formData.preferences.ageRange.max}
                onChange={(e) => handleDoubleNestedChange('preferences', 'ageRange', 'max', e.target.value)}
                min="0"
                max="18"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Gender</label>
              <select
                className="form-control"
                value={formData.preferences.gender}
                onChange={(e) => handleNestedChange('preferences', 'gender', e.target.value)}
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.preferences.specialNeeds}
                  onChange={(e) => handleNestedChange('preferences', 'specialNeeds', e.target.checked)}
                />
                <span>Open to Special Needs Child</span>
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.preferences.siblings}
                  onChange={(e) => handleNestedChange('preferences', 'siblings', e.target.checked)}
                />
                <span>Open to Siblings</span>
              </label>
            </div>
          </div>
        </div>

        {/* Motivation */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '20px' }}>Motivation & Experience</h2>
          
          <div className="form-group">
            <label className="form-label">Reason for Adoption</label>
            <textarea
              className="form-control"
              value={formData.motivation.reasonForAdoption}
              onChange={(e) => handleNestedChange('motivation', 'reasonForAdoption', e.target.value)}
              rows="3"
              placeholder="Why do you want to adopt?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience with Children</label>
            <textarea
              className="form-control"
              value={formData.motivation.experienceWithChildren}
              onChange={(e) => handleNestedChange('motivation', 'experienceWithChildren', e.target.value)}
              rows="3"
              placeholder="Describe your experience with children"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parenting Style</label>
            <textarea
              className="form-control"
              value={formData.motivation.parentingStyle}
              onChange={(e) => handleNestedChange('motivation', 'parentingStyle', e.target.value)}
              rows="3"
              placeholder="Describe your parenting approach"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/parents')}
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
            <span>{loading ? 'Registering...' : 'Register Parent'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddParent;
