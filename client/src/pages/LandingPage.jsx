import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LightRays from '../components/LightRays/LightRays';
import { authService } from '../services/auth.service';
import { LogOut, ChevronDown } from 'lucide-react';

export const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user || data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Transparent Navbar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-transparent">
        <Link to="/" className="font-bold text-2xl tracking-tight">
          Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-400">Found</span>
        </Link>
        <div className="flex gap-6 items-center text-sm font-medium">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          {user ? (
            <>
              <Link to="/lost" className="hover:text-indigo-400 transition-colors">Lost</Link>
              <Link to="/found" className="hover:text-indigo-400 transition-colors">Found</Link>
              <Link to="/feedback" className="hover:text-indigo-400 transition-colors">Feedback</Link>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
              {/* Profile button */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-300" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role || 'Student'}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email</span>
                          <span className="text-gray-900 font-medium text-xs">{user.collegeEmail || user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Roll No.</span>
                          <span className="text-gray-900 font-medium">{user.rollNumber || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Branch</span>
                          <span className="text-gray-900 font-medium">{user.department || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/register" className="hover:text-indigo-400 transition-colors">Register</Link>
              <Link to="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
              <Link to="/feedback" className="hover:text-indigo-400 transition-colors">Feedback</Link>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link>
            </>
          )}
        </div>
      </nav>

      {/* LightRays Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center max-w-3xl px-4 flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
          Campus <span className="text-red-500">Lost</span> & <span className="text-indigo-400">Found</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
          The central hub to report lost items and search for things found across the college campus.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/lost" 
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-red-500/30 transition-all transform hover:-translate-y-1"
          >
            I Lost Something
          </Link>
          <Link 
            to="/found" 
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-lg shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
          >
            I Found Something
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 z-10 text-gray-400 text-sm drop-shadow-sm">
        Lost it? Find it. Found it? Return it.
      </div>
    </div>
  );
};

