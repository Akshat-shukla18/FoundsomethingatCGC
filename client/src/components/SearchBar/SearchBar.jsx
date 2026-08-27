import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    startTime: '',
    endTime: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2 || query.trim().length === 0) {
       onSearch({
         q: query.trim(),
         ...filters
       });
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', startTime: '', endTime: '' });
    setQuery('');
    onSearch({ q: '' });
  };

  return (
    <div className="mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search found items (e.g., black purse, iPhone)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button 
          type="button" 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-lg border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <Filter className="h-5 w-5" />
        </button>
        <button 
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Search
        </button>
      </form>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents/IDs</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Found After</label>
            <input
              type="date"
              value={filters.startTime}
              onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Found Before</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.endTime}
                onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
              {(query || filters.category || filters.startTime || filters.endTime) && (
                 <button type="button" onClick={clearFilters} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Clear filters">
                   <X className="h-5 w-5" />
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

