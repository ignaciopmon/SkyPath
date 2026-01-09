import React, { useState, useEffect } from 'react';
import { Plane, Search, Users, Calendar, History, X } from 'lucide-react';
import { SAMPLE_CITIES } from '../constants';
import { SearchParams, SearchHistoryItem } from '../types';

interface SearchFormProps {
  params: SearchParams;
  setParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  isLoading: boolean;
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  params, 
  setParams, 
  onSearch, 
  isLoading,
  history,
  onSelectHistory
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (params.origin && params.destination) {
      onSearch();
    }
  };

  const handleChange = (key: keyof SearchParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Improved simple autocomplete UI would go here, using standard list for now but styled better
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/80 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl relative">
      
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6 text-center text-white flex items-center justify-center gap-2">
        <Plane className="text-sky-400" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-600">
          Find Your Wings
        </span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Row 1: Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Origin</label>
                <input
                    type="text"
                    list="cities"
                    value={params.origin}
                    onChange={(e) => handleChange('origin', e.target.value)}
                    placeholder="City or Airport (e.g. JFK)"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                    required
                />
            </div>
            <div className="relative">
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Destination</label>
                <input
                    type="text"
                    list="cities"
                    value={params.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                    placeholder="City or Airport (e.g. Tokyo)"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-medium"
                    required
                />
            </div>
        </div>

        {/* Row 2: Dates, Pax, Class */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {/* Depart */}
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 flex items-center gap-1"><Calendar size={10}/> Depart</label>
                <input 
                    type="date" 
                    value={params.departDate}
                    onChange={(e) => handleChange('departDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-500"
                />
             </div>
             
             {/* Return */}
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 flex items-center gap-1"><Calendar size={10}/> Return</label>
                <input 
                    type="date" 
                    value={params.returnDate}
                    onChange={(e) => handleChange('returnDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-500"
                />
             </div>

             {/* Passengers */}
             <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1 ml-1 flex items-center gap-1"><Users size={10}/> Travelers</label>
                 <select 
                    value={params.passengers}
                    onChange={(e) => handleChange('passengers', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
                 >
                     {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1 ? 'Adult' : 'Adults'}</option>)}
                 </select>
             </div>

             {/* Class */}
             <div>
                 <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Class</label>
                 <select 
                    value={params.cabinClass}
                    onChange={(e) => handleChange('cabinClass', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
                 >
                     <option value="Economy">Economy</option>
                     <option value="Premium Economy">Premium</option>
                     <option value="Business">Business</option>
                     <option value="First">First Class</option>
                 </select>
             </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full mt-4 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Search size={20} />
              <span>Search Flights</span>
            </>
          )}
        </button>
      </form>

      {/* Recent Searches Chips */}
      {history.length > 0 && (
          <div className="mt-6 border-t border-slate-700/50 pt-4">
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                  <History size={12}/> Recent Searches
              </div>
              <div className="flex flex-wrap gap-2">
                  {history.slice(0, 3).map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => onSelectHistory(item)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-full border border-slate-600 text-xs text-slate-300 transition-colors"
                      >
                          <span>{item.origin.split(' ')[0]} ⇄ {item.destination.split(' ')[0]}</span>
                      </button>
                  ))}
              </div>
          </div>
      )}

      <datalist id="cities">
        {SAMPLE_CITIES.map(city => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </div>
  );
};

export default SearchForm;