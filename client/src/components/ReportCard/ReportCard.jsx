import { MapPin, Clock, Building, CheckCircle2, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ReportCard = ({ report, isOwner = false, onMarkResolved = null }) => {
  const { isDark } = useTheme();
  const { 
    _id,
    itemName, 
    description, 
    location, 
    eventAt, 
    images, 
    reportType,
    status,
    createdBy 
  } = report;

  const isLost = reportType === 'LOST';
  const isResolved = status === 'RESOLVED';

  const colorClass = isResolved
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : isLost 
      ? 'text-red-500 border-red-500/30 bg-red-500/10' 
      : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';

  const badgeColor = isLost ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';

  const senderName = createdBy?.name || 'Anonymous Student';
  const senderDept = createdBy?.department || 'Campus Student';
  const senderInitial = senderName.charAt(0).toUpperCase();

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all backdrop-blur-md flex flex-col justify-between ${
      isResolved
        ? isDark
          ? 'bg-emerald-950/20 border-emerald-500/30 text-white hover:border-emerald-500/50'
          : 'bg-emerald-50/70 border-emerald-200 text-gray-900'
        : isDark 
          ? 'bg-gray-900/60 border-white/10 text-white hover:border-white/20 hover:shadow-lg' 
          : 'bg-white/90 border-gray-200 text-gray-900 hover:shadow-md'
    }`}>
      
      {/* ===== SENDER / POSTER HEADER ===== */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
        isResolved
          ? isDark ? 'bg-emerald-950/40 border-emerald-500/20' : 'bg-emerald-100/50 border-emerald-200'
          : isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50/80 border-gray-100'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
            {senderInitial}
          </div>
          <div className="min-w-0 text-left">
            <p className={`text-xs font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {senderName}
            </p>
            <p className={`text-[11px] truncate flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Building className="h-3 w-3 shrink-0" />
              <span>{senderDept}</span>
            </p>
          </div>
        </div>

        {/* Badges: Type & Resolved */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isResolved ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
              <Check className="h-3 w-3" /> Resolved
            </span>
          ) : (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeColor}`}>
              {isLost ? 'Lost' : 'Found'}
            </span>
          )}
        </div>
      </div>

      {/* ===== IMAGE PLACEHOLDER OR ACTUAL IMAGE ===== */}
      <div className={`h-48 w-full relative ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        {images && images.length > 0 ? (
          <img src={images[0].url} alt={itemName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No Image Attached
          </div>
        )}

        {/* Resolved overlay watermark if resolved */}
        {isResolved && (
          <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Item Resolved
            </span>
          </div>
        )}
      </div>

      {/* ===== CARD DETAILS BODY ===== */}
      <div className="p-4 flex-1 flex flex-col justify-between text-left">
        <div>
          <h3 className={`font-semibold text-lg mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {itemName}
          </h3>
          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
          
          <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
              <span className="line-clamp-1">{location?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>{new Date(eventAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          {/* Mark as Resolved option for owner */}
          {isOwner && !isResolved && onMarkResolved && (
            <button
              onClick={() => onMarkResolved(_id)}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all transform active:scale-95 shadow-md hover:shadow-emerald-600/30 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" /> Mark as Resolved
            </button>
          )}

          <button className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors border ${colorClass} hover:opacity-90`}>
            {isResolved ? 'View Resolved Details' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
