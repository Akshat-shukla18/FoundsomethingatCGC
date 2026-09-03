import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, KeyRound } from 'lucide-react';
import { authService } from '../services/auth.service';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Login state
  const [collegeEmail, setCollegeEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [mode, setMode] = useState('login'); // 'login' | 'forgot-email' | 'forgot-otp'
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

        {/* ===== LEFT COLUMN: SIGN IN FORM ===== */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* App Brand Header */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                C
              </div>
              <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-500">Found</span>
              </span>
            </div>

            {/* ===== MODE: LOGIN ===== */}
            {mode === 'login' && (
              <>
                <div className="mb-6">
                  <h1 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Welcome Back
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Please enter your details to sign in
                  </p>
                </div>

                {location.state?.email && !success && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                    Registration successful! Please sign in with your password.
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      placeholder="admin@college.edu"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={switchToForgot}
                      className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className={`mt-6 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline">
                    Sign up
                  </Link>
                </p>
              </>
            )}

            {/* ===== MODE: FORGOT PASSWORD EMAIL ===== */}
            {mode === 'forgot-email' && (
              <>
                <div className="mb-6">
                  <h1 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Forgot Password
                  </h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Enter your college email to receive a 6-digit OTP.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      College Email
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className={inputClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <button 
                  onClick={switchToLogin}
                  className={`mt-6 w-full text-center text-xs font-semibold transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ← Back to Sign In
                </button>
              </>
            )}

            {/* ===== MODE: FORGOT PASSWORD OTP + NEW PASS ===== */}
            {mode === 'forgot-otp' && (
              <>
                <div className="mb-6">
                  <h1 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Reset Password
                  </h1>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Enter the OTP sent to <span className="font-semibold text-indigo-400">{resetEmail}</span>
                  </p>
                </div>

                {success && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl text-xs font-medium">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className={`${inputClass} text-center tracking-[0.3em] font-mono`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={inputClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <button 
                  onClick={switchToLogin}
                  className={`mt-4 w-full text-center text-xs font-semibold transition-colors cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ← Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN: SCENIC HERO BANNER ===== */}
        <div 
          className="relative hidden md:flex flex-col items-center justify-center p-12 text-center text-white bg-cover bg-center overflow-hidden min-h-[480px]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop')`
          }}
        >
          {/* Soft Dark & Color Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-black/20 to-black/60 backdrop-blur-[0.5px]"></div>

          <div className="relative z-10 flex flex-col items-center max-w-xs space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">
              Welcome back!
            </h2>
            <p className="text-white/90 text-sm font-medium drop-shadow leading-relaxed">
              Log in to access your account and continue your journey with us.
            </p>

            <Link
              to="/register"
              className="mt-4 px-8 py-2.5 rounded-full border-2 border-white/90 text-white font-bold text-sm backdrop-blur-sm hover:bg-white hover:text-slate-900 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-black/30"
            >
              Sign up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
