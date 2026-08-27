import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    collegeEmail: '',
    rollNumber: '',
    department: '',
    semester: 1,
    classSection: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/register', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful</h2>
          <p className="text-gray-600 mb-6">Please check your email to verify your account.</p>
          <Link to="/login" className="text-indigo-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Register</h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required 
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input 
            type="email" placeholder="College Email" required 
            value={formData.collegeEmail} onChange={e => setFormData({...formData, collegeEmail: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input 
            type="text" placeholder="Roll Number" required 
            value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="flex gap-4">
            <input 
              type="text" placeholder="Department" required 
              value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <input 
              type="text" placeholder="Section" required 
              value={formData.classSection} onChange={e => setFormData({...formData, classSection: e.target.value})}
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <input 
            type="password" placeholder="Password (min 8 chars)" required 
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-4 disabled:opacity-50"
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

