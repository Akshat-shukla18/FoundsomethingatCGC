import { useState } from 'react';
import { Link } from 'react-router-dom';

export const FeedbackPage = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:ashukla20062006@gmail.com?subject=Platform Feedback: ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">We value your Feedback</h2>
        <p className="text-center text-gray-500 mb-8">Help us improve the Campus Lost & Found platform.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
              type="text" 
              required 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., Bug Report, Feature Request"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Details</label>
            <textarea 
              required 
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>
          <button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Send Feedback (via Email)
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/" className="text-gray-500 text-sm hover:text-indigo-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

