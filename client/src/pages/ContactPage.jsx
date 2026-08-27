import { Link } from 'react-router-dom';

export const ContactPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
        <p className="text-gray-600 mb-8 text-lg">
          For any queries, issues, or administrative support regarding the Campus Lost & Found platform, please contact the admin directly.
        </p>
        <div className="bg-indigo-50 p-6 rounded-lg mb-8">
          <p className="font-semibold text-indigo-900 mb-2">Admin Email:</p>
          <a href="mailto:ashukla20062006@gmail.com" className="text-xl font-mono text-indigo-600 hover:underline">
            ashukla20062006@gmail.com
          </a>
        </div>
        <Link to="/" className="text-indigo-600 font-medium hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

