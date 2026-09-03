import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, BookOpen, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
      navigate('/login', { state: { email: formData.collegeEmail } });
    } catch (err) {
      const errorMsg = err.details ? err.details.join(', ') : (err.message || 'Registration failed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  const inputClass = `w-full p-3.5 rounded-xl border transition-all duration-300 outline-none text-sm ${
    isDark
      ? 'bg-slate-900/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm'
  }`;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className={`max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border transition-all duration-500 ${
        isDark 
          ? 'bg-slate-950/80 border-slate-800 shadow-black/60' 
          : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/60'
      }`}>

        {/* ===== LEFT COLUMN: SCENIC HERO BANNER (OPPOSITE SIDE) ===== */}
        <div 
          className="relative hidden md:flex flex-col items-center justify-center p-12 text-center text-white bg-cover bg-center overflow-hidden min-h-[550px]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop')`
          }}
        >
          {/* Soft Dark & Color Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-black/30 to-black/70 backdrop-blur-[0.5px]"></div>

          <div className="relative z-10 flex flex-col items-center max-w-xs space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
              Join us today!
            </h2>
            <p className="text-white/90 text-sm font-medium drop-shadow leading-relaxed">
              Create your account to report lost belongings or help reunite found items across campus.
            </p>

            <Link
              to="/login"
              className="mt-4 px-8 py-2.5 rounded-full border-2 border-white/90 text-white font-bold text-sm backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-black/30"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* ===== RIGHT COLUMN: REGISTRATION FORM ===== */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* App Brand Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                C
              </div>
              <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-500">Found</span>
              </span>
            </div>

            <div className="mb-6">
              <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Create Account
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Please enter your details to sign up
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}
            {otpMessage && !error && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                {otpMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={set('name')}
                  className={inputClass}
                />
              </div>

              {/* Email + Send OTP button */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  College Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    required
                    value={formData.collegeEmail}
                    onChange={set('collegeEmail')}
                    disabled={otpSent}
                    className={`${inputClass} flex-1 disabled:opacity-60`}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !formData.collegeEmail}
                    className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md shadow-indigo-500/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* OTP input — appears after OTP is sent */}
              {otpSent && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={set('otp')}
                    className={`${inputClass} text-center tracking-[0.3em] font-mono`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 210101001"
                  required
                  value={formData.rollNumber}
                  onChange={set('rollNumber')}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE"
                    required
                    value={formData.department}
                    onChange={set('department')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    required
                    value={formData.classSection}
                    onChange={set('classSection')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  required
                  value={formData.password}
                  onChange={set('password')}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otpSent}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className={`mt-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
