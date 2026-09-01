import { MapPin, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ReportCard = ({ report }) => {
  const { isDark } = useTheme();
  const { 
    itemName, 
    description, 
    location, 
    eventAt, 
    images, 
    reportType 
  } = report;

  const isLost = reportType === 'LOST';
  const colorClass = isLost ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
  const badgeColor = isLost ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-all backdrop-blur-md ${
      isDark 
        ? 'bg-gray-900/60 border-white/10 text-white hover:border-white/20 hover:shadow-lg' 
        : 'bg-white/80 border-gray-200 text-gray-900 hover:shadow-md'
    }`}>
      {/* Image Placeholder or Actual Image */}
      <div className={`h-48 w-full relative ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        {images && images.length > 0 ? (
          <img src={images[0].url} alt={itemName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No Image
          </div>
        )}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${badgeColor}`}>
          {isLost ? 'Lost' : 'Found'}
        </div>
      </div>

      <div className="p-4">
        <h3 className={`font-semibold text-lg mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{itemName}</h3>
        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        
        <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{location?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{new Date(eventAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button className={`mt-5 w-full py-2 rounded-lg font-medium text-sm transition-colors border ${colorClass} hover:opacity-90`}>
          View Details
        </button>
      </div>
    </div>
  );
};
