import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, Sun, Moon, MessageSquare } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { chatService } from '../../services/chat.service';
import { initSocket, getSocket } from '../../services/socket';
import { useTheme } from '../../context/ThemeContext';
import Lanyard from '../Lanyard/Lanyard';
import lanyardCardFace from '../../assets/lanyard-card-face.png';

export const Header = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // 1. Fetch current authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getMe();
        const currentUser = data.user || data;
        setUser(currentUser);
        if (currentUser) {
          initSocket(currentUser._id);
          fetchUnreadSummary();
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]);

  // 2. Fetch unread counts summary
  const fetchUnreadSummary = async () => {
    try {
      const res = await chatService.getUnreadSummary();
      setUnreadCount(res?.data?.unreadCount || res?.unreadCount || 0);
      setPendingRequestsCount(res?.data?.pendingRequestsCount || res?.pendingRequestsCount || 0);
    } catch {
      // ignore
    }
  };

  // 3. Socket listener for real-time notification badge
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleNewMessage = () => {
      if (location.pathname !== '/chat') {
        fetchUnreadSummary();
      }
    };

    const handleNewConversation = () => {
      fetchUnreadSummary();
    };

    socket.on('message.new', handleNewMessage);
    socket.on('notification.unread', handleNewMessage);
    socket.on('conversation.new', handleNewConversation);

    // Periodic poll every 20 seconds as fallback
    const interval = setInterval(fetchUnreadSummary, 20000);

    return () => {
      socket.off('message.new', handleNewMessage);
      socket.off('notification.unread', handleNewMessage);
      socket.off('conversation.new', handleNewConversation);
      clearInterval(interval);
    };
  }, [user, location.pathname]);

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

  // Hide header on landing page (it has its own transparent nav)
  if (location.pathname === '/') return null;

  const totalNotifications = unreadCount + pendingRequestsCount;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            {/* Logo with 3D Lanyard Badge hanging underneath */}
            <div className="relative flex flex-col items-start">
              <Link to={user ? '/home' : '/'} className={`font-bold text-xl tracking-tight z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Campus<span className="text-red-500">Lost</span>&<span className="text-indigo-400">Found</span>
              </Link>
              
              {/* Interactive 3D Lanyard hanging under the logo */}
              <div className="w-48 h-72 absolute -top-2 -left-4 pointer-events-auto z-40 overflow-visible hidden sm:block">
                <Lanyard 
                  position={[0, 0, 20]} 
                  gravity={[0, -40, 0]} 
                  frontImage={lanyardCardFace}
                  backImage={lanyardCardFace}
                  imageFit="cover"
                  lanyardWidth={1.8}
                />
              </div>
            </div>
            
            <nav className="hidden md:flex gap-6 sm:ml-16">
              <Link 
                to="/lost" 
                className={`font-medium text-sm transition-colors ${isActive('/lost') ? 'text-red-500' : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Lost
              </Link>
              <Link 
                to="/found" 
                className={`font-medium text-sm transition-colors ${isActive('/found') ? 'text-indigo-400' : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Found
              </Link>
              <Link 
                to="/feedback" 
                className={`font-medium text-sm transition-colors ${isActive('/feedback') ? 'text-indigo-400' : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Feedback
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium text-sm transition-colors ${isActive('/contact') ? 'text-indigo-400' : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Chat Icon with Real-Time Notification Badge */}
            {user && (
              <Link
                to="/chat"
                className={`relative p-2 rounded-full transition-all ${
                  isActive('/chat')
                    ? isDark ? 'bg-indigo-600/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                    : isDark ? 'text-gray-300 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
                title="Campus Chats & Requests"
              >
                <MessageSquare className="h-5 w-5" />

                {/* Red Notification Dot / Count Badge */}
                {totalNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-lg animate-pulse">
                    {totalNotifications > 9 ? '9+' : totalNotifications}
                  </span>
                )}
              </Link>
            )}

            {/* Day/Night Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDark ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-200/60'}`}
              title={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
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
            ) : (
              <Link to="/login" className={`flex items-center gap-2 p-2 rounded-full transition-colors md:px-4 md:py-2 md:rounded-lg md:border ${isDark ? 'text-gray-300 hover:bg-white/10 md:border-white/20' : 'text-gray-500 hover:bg-gray-100 md:border-gray-200'}`}>
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
