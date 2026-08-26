import { MapPin, Clock } from 'lucide-react';

export const ReportCard = ({ report }) => {
  const { 
    itemName, 
    description, 
    location, 
    eventAt, 
    images, 
    reportType 
  } = report;

  const isLost = reportType === 'LOST';
  const colorClass = isLost ? 'text-lost border-lost bg-red-50' : 'text-found border-found bg-indigo-50';
  const badgeColor = isLost ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Placeholder or Actual Image */}
      <div className="h-48 bg-gray-100 w-full relative">
        {images && images.length > 0 ? (
          <img src={images[0].url} alt={itemName} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
          {isLost ? 'Lost' : 'Found'}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{itemName}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{location?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{new Date(eventAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button className={`mt-5 w-full py-2 rounded-lg font-medium text-sm transition-colors border ${colorClass} hover:bg-opacity-80`}>
          View Details
        </button>
      </div>
    </div>
  );
};

