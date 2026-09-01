import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const ReportForm = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'LOST';
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Animation state
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Dynamic theme classes
  const isLost = type === 'LOST';
  const themeColor = isLost ? 'red' : 'blue';
  
  const submitBtnClass = isDark
    ? isLost
      ? 'bg-red-600/90 hover:bg-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(248,113,113,0.6)] text-white'
      : 'bg-blue-600/90 hover:bg-blue-500 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(96,165,250,0.6)] text-white'
    : isLost
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30';

  const inputClass = `w-full p-4 rounded-xl border-2 transition-all duration-300 outline-none ${
    isDark
      ? `bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-${themeColor}-500 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(var(--${themeColor}-500),0.15)]`
      : `bg-slate-50 border-slate-200 text-slate-900 focus:border-${themeColor}-500 focus:bg-white focus:ring-4 focus:ring-${themeColor}-500/10`
  }`;

  const labelClass = `block text-sm font-bold tracking-wide mb-2 uppercase ${
    isDark ? 'text-slate-400' : 'text-slate-600'
  }`;

  return (
    <div className={`min-h-screen py-12 px-4 transition-colors duration-700 ease-in-out ${
      isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950' : 'bg-slate-50'
    }`}>
      <div className={`max-w-2xl mx-auto transition-all duration-1000 ease-out transform ${
        isMounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 ${
            isDark 
              ? isLost ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-200' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-200'
              : 'text-slate-900'
          }`}>
            Report {isLost ? 'a Lost Item' : 'a Found Item'}
          </h1>
          <p className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Please provide as many details as possible to help identify the item.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl backdrop-blur-sm animate-pulse">
            {error}
          </div>
        )}

        {/* Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className={`space-y-6 p-8 rounded-3xl backdrop-blur-xl border transition-all duration-500 ${
            isDark 
              ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 shadow-2xl' 
              : 'bg-white border-slate-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:border-slate-300'
          }`}
        >
          {/* Item Name Block */}
          <div className="group">
            <label className={labelClass}>Item Name</label>
            <input 
              type="text" 
              placeholder="e.g. Blue Hydroflask, Apple AirPods"
              value={formData.itemName}
              onChange={(e) => setFormData({...formData, itemName: e.target.value})}
              className={inputClass}
              required 
            />
          </div>

          {/* Description Block */}
          <div className="group">
            <label className={labelClass}>Description</label>
            <textarea 
              placeholder="Describe distinguishing features, contents, or serial numbers..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`${inputClass} min-h-[140px] resize-y`}
              required 
            />
          </div>

          {/* Location & Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className={labelClass}>
                Location ({isLost ? 'Lost' : 'Found'})
              </label>
              <input 
                type="text" 
                placeholder="e.g. Student Union Library"
                value={formData.locationLabel}
                onChange={(e) => setFormData({...formData, locationLabel: e.target.value})}
                className={inputClass}
                required 
              />
            </div>
            <div className="group">
              <label className={labelClass}>
                Date ({isLost ? 'Lost' : 'Found'})
              </label>
              <input 
                type="date" 
                value={formData.eventAt}
                onChange={(e) => setFormData({...formData, eventAt: e.target.value})}
                className={`${inputClass} cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
                  isDark ? '[&::-webkit-calendar-picker-indicator]:invert' : ''
                }`}
                required 
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                isDark 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${submitBtnClass}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};