import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const ContactPage = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className={`max-w-xl w-full rounded-xl shadow-lg border p-8 text-center backdrop-blur-xl ${
        isDark ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-900'
      }`}>
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className={`mb-8 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          For any queries, issues, or administrative support regarding the Campus Lost & Found platform, please contact the admin directly.
        </p>
        <div className={`p-6 rounded-lg mb-8 ${isDark ? 'bg-indigo-950/60 border border-indigo-500/20' : 'bg-indigo-50'}`}>
          <p className={`font-semibold mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Admin Email:</p>
          <a href="mailto:ashukla20062006@gmail.com" className="text-xl font-mono text-indigo-400 hover:underline">
            ashukla20062006@gmail.com
          </a>
        </div>
        <Link to="/" className="text-indigo-400 font-medium hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};
