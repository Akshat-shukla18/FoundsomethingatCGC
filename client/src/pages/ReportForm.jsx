import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export const ReportForm = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'LOST';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    locationLabel: '',
    eventAt: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        reportType: type,
        itemName: formData.itemName,
        description: formData.description,
        location: { label: formData.locationLabel },
        eventAt: new Date(formData.eventAt).toISOString(),
        images: [] // Handle images later per MVP spec
      };

      await api.post('/reports', payload);
      navigate(type === 'LOST' ? '/lost' : '/found');
    } catch (err) {
      setError(err.message || 'Failed to create report. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  const colorClass = type === 'LOST' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Report {type === 'LOST' ? 'a Lost Item' : 'a Found Item'}</h1>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input 
            type="text" 
            value={formData.itemName}
            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
            required 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location ({type === 'LOST' ? 'Lost' : 'Found'})</label>
            <input 
              type="text" 
              value={formData.locationLabel}
              onChange={(e) => setFormData({...formData, locationLabel: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date ({type === 'LOST' ? 'Lost' : 'Found'})</label>
            <input 
              type="date" 
              value={formData.eventAt}
              onChange={(e) => setFormData({...formData, eventAt: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
          </div>
        </div>
        
        <div className="pt-4 flex gap-4">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className={`flex-1 py-3 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${colorClass}`}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
