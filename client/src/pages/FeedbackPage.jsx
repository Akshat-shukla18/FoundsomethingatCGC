import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const FeedbackPage = () => {
  const { isDark } = useTheme();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:ashukla20062006@gmail.com?subject=Platform Feedback: ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className={`max-w-xl w-full rounded-xl shadow-lg border p-8 backdrop-blur-xl ${
        isDark ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-gray-900'
      }`}>
        <h2 className="text-3xl font-bold mb-2 text-center">We value your Feedback</h2>
        <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Help us improve the Campus Lost & Found platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
            <input 
              type="text" 
              required 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Bug Report, Feature Request"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                isDark ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Feedback Details</label>
            <textarea 
              required 
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Tell us what you think..."
              className={`w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                isDark ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Send Feedback (via Email)
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'}`}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
