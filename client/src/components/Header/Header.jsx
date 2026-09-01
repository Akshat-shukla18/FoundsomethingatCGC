import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const Header = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Fetch current user on mount
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

  // Close popup when clicking outside
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
    try {
      await authService.logout();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-bold text-xl tracking-tight text-gray-900">
              Campus<span className="text-lost">Lost</span>&<span className="text-found">Found</span>
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link 
                to="/lost" 
                className={`font-medium text-sm transition-colors ${isActive('/lost') ? 'text-lost' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Lost
              </Link>
              <Link 
                to="/found" 
                className={`font-medium text-sm transition-colors ${isActive('/found') ? 'text-found' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Found
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              /* Logged-in: show user name with profile popup */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* Profile Info */}
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
                    {/* Logout */}
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
            ) : (
              /* Not logged in: show Sign In link */
              <Link to="/login" className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors md:px-4 md:py-2 md:rounded-lg md:border md:border-gray-200">
                <User className="h-5 w-5" />
                <span className="hidden md:block text-sm font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
