import { useState } from 'react';
import { MapPin, ShieldAlert, X, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LocationModal = ({ isOpen, onClose, onShareLocation }) => {
  const { isDark } = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Campus Meeting Spot');

  if (!isOpen) return null;

  const handleFetchAndShare = () => {
    if (!agreed) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onShareLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: locationLabel.trim() || 'Current Location'
        });
        onClose();
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'Unable to retrieve location. Please check your browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`max-w-md w-full rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">Share Meeting Location</h3>
              <p className="text-xs text-slate-400 mt-1">Coordinate handover safely</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold mb-1">Safety Declaration</p>
            <p className="text-amber-600/90 dark:text-amber-400/90">
              "By sharing your location, you acknowledge that you are doing so voluntarily and take full responsibility for your personal safety. Always meet in open, well-lit campus public areas (e.g. Library, Canteen, Student Block)."
            </p>
          </div>
        </div>

        {/* Meeting Label Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-400">
            Location Name / Note (Optional)
          </label>
          <input
            type="text"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            placeholder="e.g. Block 3 Cafeteria"
            className={`w-full p-3 rounded-xl border text-sm outline-none transition-colors ${
              isDark 
                ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
        </div>

        {/* Mandatory Agreement Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-400 cursor-pointer"
          />
          <span className="text-xs font-medium text-slate-300 dark:text-slate-300 leading-snug">
            I agree and understand that I am responsible for sharing my location and meeting in a safe campus area.
          </span>
        </label>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!agreed || loading}
            onClick={handleFetchAndShare}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Share Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
