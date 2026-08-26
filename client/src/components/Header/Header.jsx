import { Link, useLocation } from 'react-router-dom';
import { Search, User } from 'lucide-react';

export const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
            <Link to="/login" className="flex items-center gap-2 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors md:px-4 md:py-2 md:rounded-lg md:border md:border-gray-200">
              <User className="h-5 w-5" />
              <span className="hidden md:block text-sm font-medium">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

