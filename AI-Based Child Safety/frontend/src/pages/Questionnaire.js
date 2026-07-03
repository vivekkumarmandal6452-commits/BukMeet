import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const Questionnaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    safeAtHome: '',
    attendingSchool: '',
    needHelp: '',
    parentTreatment: '',
    parentTreatmentDetails: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.safeAtHome || !form.attendingSchool || !form.needHelp || !form.parentTreatment) {
      toast.error('Please answer all required questions');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/children/${id}/questionnaire`, form);
      setResult(response.data.data);
      toast.success('Questionnaire submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <div className="card">
        <h2>Interactive Child Questionnaire</h2>
        <p>Collect responses and generate an emotional analysis score for this child.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px', marginTop: '20px' }}>
          <label>
            Are you safe at home? <span style={{ color: 'red' }}>*</span>
            <select name="safeAtHome" value={form.safeAtHome} onChange={handleChange} className="form-control">
              <option value="">Select an answer</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="sometimes">Sometimes</option>
            </select>
          </label>

          <label>
            Are you attending school? <span style={{ color: 'red' }}>*</span>
            <select name="attendingSchool" value={form.attendingSchool} onChange={handleChange} className="form-control">
              <option value="">Select an answer</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="sometimes">Sometimes</option>
            </select>
          </label>

          <label>
            Do you need help? <span style={{ color: 'red' }}>*</span>
            <select name="needHelp" value={form.needHelp} onChange={handleChange} className="form-control">
              <option value="">Select an answer</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not sure">Not sure</option>
            </select>
          </label>

          <label>
            How are your parents treating you? <span style={{ color: 'red' }}>*</span>
            <select name="parentTreatment" value={form.parentTreatment} onChange={handleChange} className="form-control">
              <option value="">Select an answer</option>
              <option value="very good">Very good</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="abusive">Abusive</option>
            </select>
          </label>

          <label>
            Tell us more about how your parents treat you
            <textarea
              name="parentTreatmentDetails"
              value={form.parentTreatmentDetails}
              onChange={handleChange}
              className="form-control"
              rows={4}
              placeholder="Describe in your own words"
            />
          </label>

          <label>
            Additional notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="form-control"
              rows={3}
              placeholder="Optional notes"
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Questionnaire'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Emotional Analysis Result</h3>
          <p><strong>Score:</strong> {result.emotionalAnalysisScore}</p>
          <p><strong>Risk Level:</strong> {result.emotionalRiskLevel}</p>
          <ul>
            <li><strong>Safe at home:</strong> {result.safeAtHome}</li>
            <li><strong>Attending school:</strong> {result.attendingSchool}</li>
            <li><strong>Needs help:</strong> {result.needHelp}</li>
            <li><strong>Parent treatment:</strong> {result.parentTreatment}</li>
            <li><strong>Details:</strong> {result.parentTreatmentDetails || 'None'}</li>
          </ul>
          {result.notes && <p><strong>Notes:</strong> {result.notes}</p>}
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
