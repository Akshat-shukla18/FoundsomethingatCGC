import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    collegeEmail: '',
    rollNumber: '',
    department: '',
    semester: 1,
    classSection: '',
    password: '',
    otp: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const handleSendOtp = async () => {
    if (!formData.collegeEmail) {
      setError('Please enter your college email first.');
      return;
    }
    try {
      setOtpLoading(true);
      setError(null);
      setOtpMessage('');
      const res = await api.post('/auth/send-otp', { collegeEmail: formData.collegeEmail });
      setOtpSent(true);
      setOtpMessage(res?.data?.message || 'OTP sent! Check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      setError('Please verify your email first by clicking "Send OTP".');
      return;
    }
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/register', formData);
      // Registration successful → go to login with email pre-filled
      navigate('/login', { state: { email: formData.collegeEmail } });
    } catch (err) {
      // api interceptor already unwraps: err = { code, message, details }
      const errorMsg = err.details ? err.details.join(', ') : (err.message || 'Registration failed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Register</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {otpMessage && !error && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{otpMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text" placeholder="Full Name" required
            value={formData.name} onChange={set('name')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          {/* Email + Send OTP button */}
          <div className="flex gap-2">
            <input
              type="email" placeholder="College Email" required
              value={formData.collegeEmail} onChange={set('collegeEmail')}
              disabled={otpSent}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpLoading || !formData.collegeEmail}
              className="px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
            </button>
          </div>

          {/* OTP input — appears after OTP is sent */}
          {otpSent && (
            <input
              type="text" placeholder="Enter 6-digit OTP" required
              maxLength={6}
              value={formData.otp} onChange={set('otp')}
              className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-[0.3em] text-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          )}

          <input
            type="text" placeholder="Roll Number" required
            value={formData.rollNumber} onChange={set('rollNumber')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex gap-4">
            <input
              type="text" placeholder="Department" required
              value={formData.department} onChange={set('department')}
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input
              type="text" placeholder="Section" required
              value={formData.classSection} onChange={set('classSection')}
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <input
            type="password" placeholder="Password (min 8 chars)" required
            value={formData.password} onChange={set('password')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <button
            type="submit" disabled={loading || !otpSent}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};
