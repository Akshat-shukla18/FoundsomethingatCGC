import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import api from '../services/api';

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Login state
  const [collegeEmail, setCollegeEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [mode, setMode] = useState('login'); // 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-newpass'
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await authService.login(collegeEmail, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) { setError('Please enter your email.'); return; }
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/forgot-password', { collegeEmail: resetEmail });
      setSuccess('If this account exists, an OTP has been sent to your email.');
      setMode('forgot-otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    if (!newPassword || newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/reset-password', { collegeEmail: resetEmail, otp: resetOtp, newPassword });
      setSuccess('Password reset successfully! Please sign in.');
      setCollegeEmail(resetEmail);
      setMode('login');
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const switchToForgot = () => {
    setMode('forgot-email');
    setError(null);
    setSuccess(null);
    setResetEmail(collegeEmail);
  };

  const switchToLogin = () => {
    setMode('login');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">

        {/* ===== LOGIN MODE ===== */}
        {mode === 'login' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Sign In</h2>

            {location.state?.email && !success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                Registration successful! Please sign in with your password.
              </div>
            )}
            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
                <input
                  type="email"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={switchToForgot}
              className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline"
            >
              Forgot Password?
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Register here</Link>
            </p>
          </>
        )}

        {/* ===== FORGOT PASSWORD: ENTER EMAIL ===== */}
        {mode === 'forgot-email' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Enter your college email and we'll send you a 6-digit OTP.</p>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSendResetOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <button onClick={switchToLogin} className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700">
              ← Back to Sign In
            </button>
          </>
        )}

        {/* ===== FORGOT PASSWORD: ENTER OTP + NEW PASSWORD ===== */}
        {mode === 'forgot-otp' && (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Reset Password</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Enter the OTP sent to <span className="font-medium text-gray-700">{resetEmail}</span> and your new password.
            </p>

            {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-[0.3em] text-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <button onClick={switchToLogin} className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700">
              ← Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};
