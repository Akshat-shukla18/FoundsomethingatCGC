import { MapPin, MapPinOff } from 'lucide-react';
import { useLocationShare } from '../../hooks/useLocationShare';

export const LocationShareButton = ({ socket, conversationId, currentUserId }) => {
  const { isSharing, startSharing, stopSharing, error } = useLocationShare(socket, conversationId, currentUserId);

  return (
    <div className="flex flex-col items-center">
      {error && <span className="text-xs text-red-500 mb-1">{error}</span>}
      {!isSharing ? (
        <button
          type="button"
          onClick={startSharing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
          title="Share live location (Expires in 2 hrs)"
        >
          <MapPin className="h-4 w-4" />
          <span>Share Location</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopSharing}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors animate-pulse"
          title="Stop sharing location"
        >
          <MapPinOff className="h-4 w-4" />
          <span>Stop Sharing</span>
        </button>
      )}
    </div>
  );
};

export const LocationMapPlaceholder = ({ activeShares, currentUserId }) => {
  const otherShares = Object.entries(activeShares).filter(([userId]) => userId !== currentUserId);

  if (otherShares.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800 mb-4 flex items-start gap-3">
      <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium">The other person is sharing their location.</p>
        <div className="text-xs mt-1 text-indigo-600 font-mono space-y-1">
          {otherShares.map(([userId, share]) => (
            <div key={userId}>
              Lat: {share.latitude.toFixed(5)}, Lng: {share.longitude.toFixed(5)}
              <span className="block text-indigo-400">
                Expires: {share.expiresAt.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

