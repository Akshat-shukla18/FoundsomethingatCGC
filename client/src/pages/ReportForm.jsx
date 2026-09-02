import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
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

  const [images, setImages] = useState([]); // Array of { url, objectKey, mimeType, size }
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
      };
    });
  };

  // Handle local file uploads -> compress & convert to Data URL
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      setError('You can attach a maximum of 5 images per report.');
      return;
    }

    for (const file of files) {
      try {
        const compressedUrl = await compressImage(file);
        setImages(prev => [
          ...prev,
          {
            url: compressedUrl,
            objectKey: `upload_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
            mimeType: 'image/jpeg',
            size: compressedUrl.length
          }
        ]);
      } catch {
        // fallback
      }
    }
    e.target.value = ''; // reset input
  };

  // Handle image URL addition
  const handleAddImageUrl = () => {
    if (!imageUrlInput || !imageUrlInput.trim()) return;
    if (images.length >= 5) {
      setError('You can attach a maximum of 5 images per report.');
      return;
    }
    setImages(prev => [
      ...prev,
      {
        url: imageUrlInput.trim(),
        objectKey: `url_${Date.now()}`,
        mimeType: 'image/jpeg'
      }
    ]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

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
        images: images.map(img => ({
          url: img.url,
          objectKey: img.objectKey || 'upload_key'
        }))
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
      ? 'bg-red-600/90 hover:bg-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white'
      : 'bg-blue-600/90 hover:bg-blue-500 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white'
    : isLost
      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30';

  const inputClass = `w-full p-4 rounded-xl border-2 transition-all duration-300 outline-none ${
    isDark
      ? `bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder-slate-500 focus:border-${themeColor}-500 focus:bg-slate-900`
      : `bg-slate-50 border-slate-200 text-slate-900 focus:border-${themeColor}-500 focus:bg-white`
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
            Please provide as many details and photos as possible to help identify the item.
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
              placeholder="Describe distinguishing features, contents, color, or serial numbers..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`${inputClass} min-h-[140px] resize-y`}
              required 
            />
          </div>

          {/* Image Upload Section */}
          <div className="group">
            <label className={labelClass}>Add Photos / Images (Optional - Max 5)</label>
            
            {/* Image Preview List */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group/img aspect-square rounded-xl overflow-hidden border border-gray-500/30">
                    <img src={img.url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <div className="space-y-3">
                {/* Drag and Drop / File Input Box */}
                <label className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                  isDark
                    ? 'border-slate-700 bg-slate-900/30 hover:border-indigo-500 hover:bg-slate-900/60 text-slate-400 hover:text-white'
                    : 'border-slate-300 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-600'
                }`}>
                  <Upload className="h-8 w-8 mb-2 opacity-80" />
                  <span className="text-sm font-semibold">Click to upload photos</span>
                  <span className="text-xs opacity-60 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Or paste Image URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    className={`${inputClass} !p-3 text-sm flex-1`}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1 transition-colors disabled:opacity-50 ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    <Plus className="h-4 w-4" /> Add URL
                  </button>
                </div>
              </div>
            )}
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