import React, { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import FlightMap from './components/FlightMap';
import ResultsCard from './components/ResultsCard';
import { fetchFlightData } from './services/geminiService';
import { SearchResult, SearchParams, SearchHistoryItem } from './types';
import { Cloud, Map as MapIcon, Info, Loader2, DollarSign, Euro, Github, Twitter } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  
  // New Search Params State
  const [searchParams, setSearchParams] = useState<SearchParams>({
      origin: '',
      destination: '',
      departDate: '',
      returnDate: '',
      passengers: 1,
      cabinClass: 'Economy',
      currency: 'USD'
  });

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
      const saved = localStorage.getItem('skyPathHistory');
      if (saved) {
          try {
              setHistory(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to load history");
          }
      }
  }, []);

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination) return;
    
    setLoading(true);
    setResult(null); 
    
    // Save to history
    const newItem: SearchHistoryItem = { ...searchParams, timestamp: Date.now() };
    const newHistory = [newItem, ...history.filter(h => h.origin !== searchParams.origin || h.destination !== searchParams.destination)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('skyPathHistory', JSON.stringify(newHistory));

    try {
      const data = await fetchFlightData(searchParams);
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
          flightData: null,
          guideData: null,
          flightSources: [],
          error: "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = (item: SearchHistoryItem) => {
      setSearchParams(item);
  };

  const handleCountrySelect = (countryName: string) => {
    if (!searchParams.origin) {
      setSearchParams(prev => ({...prev, origin: countryName}));
    } else if (!searchParams.destination) {
      setSearchParams(prev => ({...prev, destination: countryName}));
    } else {
      setSearchParams(prev => ({...prev, origin: countryName, destination: ''}));
      setResult(null);
    }
  };

  const toggleCurrency = () => {
      setSearchParams(prev => ({
          ...prev,
          currency: prev.currency === 'USD' ? 'EUR' : 'USD'
      }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500 selection:text-white pb-20 flex flex-col">
      
      {/* Header */}
      <header className="absolute top-0 w-full z-10 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
           <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
             <Cloud className="text-white" size={24} />
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">SkyPath<span className="text-sky-400">.ai</span></h1>
        </div>
        
        <div className="flex items-center gap-4 pointer-events-auto">
             <button 
                onClick={toggleCurrency}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur rounded-lg border border-slate-600 transition-colors text-xs font-bold"
             >
                 {searchParams.currency === 'USD' ? <DollarSign size={14} className="text-emerald-400"/> : <Euro size={14} className="text-blue-400"/>}
                 {searchParams.currency}
             </button>
             
             <div className="hidden sm:flex gap-4 border-l border-slate-700 pl-4">
                 <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</a>
             </div>
        </div>
      </header>

      {/* Main Map Visualization Area */}
      <main className="relative w-full h-[60vh] lg:h-[70vh] bg-slate-900">
         <FlightMap 
            originCoords={result?.flightData?.originCoords || null} 
            destCoords={result?.flightData?.destinationCoords || null}
            originLabel={result?.flightData ? `${result.flightData.originCode} - ${result.flightData.origin}` : searchParams.origin}
            destLabel={result?.flightData ? `${result.flightData.destinationCode} - ${result.flightData.destination}` : searchParams.destination}
            isLoading={loading}
            onCountrySelect={handleCountrySelect}
         />
         
         <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>

         {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px] z-10 animate-fade-in">
                 <div className="bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-sky-400" size={32} />
                    <span className="text-sm font-medium text-sky-100">Calculating best routes...</span>
                 </div>
             </div>
         )}
      </main>

      {/* Content Area */}
      <div className="relative z-20 -mt-20 px-4 md:px-8 flex-grow">
        
        {/* Search Form */}
        <div className="mb-10">
            <SearchForm 
              params={searchParams}
              setParams={setSearchParams}
              onSearch={handleSearch}
              isLoading={loading}
              history={history}
              onSelectHistory={handleHistorySelect}
            />
        </div>

        {/* Error Message */}
        {result?.error && (
            <div className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-300 animate-in fade-in slide-in-from-bottom-2">
                <Info className="inline-block mr-2 mb-1" size={16}/>
                {result.error}
            </div>
        )}

        {/* Results */}
        {result?.flightData && !loading && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResultsCard 
                    flightData={result.flightData} 
                    flightSources={result.flightSources} 
                />
             </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
             <div className="max-w-2xl mx-auto mt-12 text-center space-y-4 text-slate-500">
                <MapIcon size={48} className="mx-auto opacity-20"/>
                <p className="text-lg">Enter details above to get AI-powered flight estimates.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="text-xs px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-600">Google Search Grounding</span>
                    <span className="text-xs px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-600">Gemini 2.0 Flash</span>
                </div>
             </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-800 bg-slate-900/50">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-slate-600"/>
                  <span className="text-slate-500 font-bold text-sm">SkyPath.ai</span>
              </div>
              <div className="flex gap-6 text-sm text-slate-500">
                  <a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a>
              </div>
              <div className="flex gap-4">
                  <a href="#" className="text-slate-600 hover:text-white transition-colors"><Github size={18}/></a>
                  <a href="#" className="text-slate-600 hover:text-white transition-colors"><Twitter size={18}/></a>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default App;