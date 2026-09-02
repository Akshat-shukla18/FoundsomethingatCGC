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
    <div className="mb-8 max-w-4xl mx-auto">
  {/* Main Search Bar (Pill Shape with Group Hover) */}
  <form 
    onSubmit={handleSearch} 
    className="relative group flex items-center bg-white rounded-full p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border-2 border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
  >
    {/* Input Area */}
    <div className="flex-grow flex items-center pl-5">
      <Search className="h-5 w-5 text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search found items (e.g., black purse, iPhone)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-transparent pl-3 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
      />
    </div>

    {/* Actions Group (Filter & Submit) */}
    <div className="flex items-center gap-2 pr-1 shrink-0">
      {/* Filter Toggle Button */}
      <button 
        type="button" 
        onClick={() => setShowFilters(!showFilters)}
        className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
          showFilters 
            ? 'bg-indigo-100 text-indigo-700 shadow-inner' 
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        title="Toggle Filters"
      >
        <Filter className="h-5 w-5" />
      </button>

      {/* Animated Submit Arrow */}
      <button 
        type="submit"
        title="Search"
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
      >
        <svg
          className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </form>

  {/* Expandable Filters Card */}
  {showFilters && (
    <div className="mt-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents/IDs</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Found After Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Found After</label>
          <input
            type="date"
            value={filters.startTime}
            onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
          />
        </div>

        {/* Found Before & Clear Button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Found Before</label>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={filters.endTime}
              onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
            
            {/* Clear Filters Button (Only shows if filters are active) */}
            {(query || filters.category || filters.startTime || filters.endTime) && (
              <button 
                type="button" 
                onClick={clearFilters} 
                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm border border-transparent hover:border-red-100" 
                title="Clear all filters"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )}
</div>
  );
};

