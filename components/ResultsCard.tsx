import React from 'react';
import { FlightData, GroundingSource } from '../types';
import CityMap from './CityMap';
import { 
  Plane, 
  TrendingDown, 
  Zap, 
  Route, 
  Clock,
  Wifi,
  Coffee,
  BatteryCharging,
  Briefcase,
  Coins,
  Plug,
  Calendar,
  ArrowRight,
  Beer,
  Utensils,
  BedDouble,
  MapPin,
  PlaneLanding
} from 'lucide-react';

interface ResultsCardProps {
  flightData: FlightData;
  flightSources: GroundingSource[];
}

const ResultsCard: React.FC<ResultsCardProps> = ({ flightData, flightSources }) => {
  const isDirect = flightData.stops === 0;
  const durationHours = parseInt(flightData.duration) || 2;
  const hasMeal = durationHours > 4;
  const hasWifi = true;
  const hasPower = true;

  const bookingUrl = `https://www.google.com/travel/flights?q=Flights+from+${flightData.originCode}+to+${flightData.destinationCode}`;

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-slate-800 relative">
         
         {/* LEFT SIDE: Flight Ticket & Cost of Living */}
         <div className="lg:w-2/3 bg-slate-900 p-8 relative flex flex-col overflow-hidden">
             
             {/* Dynamic Background */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-sky-600/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
             
             {/* Header: Carrier & Class */}
             <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Plane className="text-sky-400 transform -rotate-45" size={20} />
                   </div>
                   <div>
                      <div className="text-white font-bold text-sm tracking-wide">{flightData.airlines[0] || "Multiple Airlines"}</div>
                      <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Flight Details</div>
                   </div>
                </div>
                <div className="px-3 py-1 bg-slate-800/80 backdrop-blur rounded-full border border-slate-700">
                    <span className="text-sky-400 text-xs font-bold font-mono tracking-widest">{flightData.currency}</span>
                </div>
             </div>

             {/* MAIN ROUTE VISUALIZATION */}
             <div className="mb-12 relative z-10">
                 <div className="flex justify-between items-center mb-4">
                    {/* Origin */}
                    <div className="text-left w-1/4">
                        <div className="text-5xl font-black text-white tracking-tight">{flightData.originCode || 'ORG'}</div>
                        <div className="text-slate-400 text-sm font-medium mt-1 truncate">{flightData.origin.split(',')[0]}</div>
                        <div className="text-slate-600 text-xs mt-0.5">Depart</div>
                    </div>

                    {/* Flight Path Graphic */}
                    <div className="flex-1 px-4 relative flex flex-col items-center">
                        <div className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                            <Clock size={12} className="text-sky-400"/>
                            {flightData.duration}
                        </div>
                        
                        <div className="w-full relative h-10 flex items-center justify-center">
                             {/* Line */}
                             <div className="absolute w-full h-[2px] bg-slate-700 top-1/2 -translate-y-1/2"></div>
                             
                             {isDirect ? (
                                 // DIRECT FLIGHT
                                 <>
                                    <div className="absolute left-0 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div className="absolute right-0 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2">
                                        <Plane className="text-sky-400 rotate-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" size={24} fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                 </>
                             ) : (
                                 // CONNECTING FLIGHT
                                 <>
                                    <div className="absolute left-0 w-2 h-2 rounded-full bg-slate-500"></div>
                                    <div className="absolute right-0 w-2 h-2 rounded-full bg-slate-500"></div>
                                    
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                                         <div className="w-3 h-3 bg-slate-900 border-2 border-sky-400 rounded-full mb-1"></div>
                                         <span className="text-[10px] font-bold text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                            {flightData.layover || "1 STOP"}
                                         </span>
                                    </div>

                                    <div className="absolute top-1/2 left-[25%] -translate-y-1/2 bg-slate-900 px-1">
                                        <Plane className="text-slate-600 rotate-90" size={14} />
                                    </div>
                                    <div className="absolute top-1/2 right-[25%] -translate-y-1/2 bg-slate-900 px-1">
                                        <Plane className="text-slate-600 rotate-90" size={14} />
                                    </div>
                                 </>
                             )}
                        </div>

                        <div className="text-sky-500 text-[10px] font-bold tracking-widest mt-2 uppercase">
                            {isDirect ? 'Direct Flight' : `${flightData.stops} Stop${flightData.stops > 1 ? 's' : ''} via ${flightData.layover || 'Hub'}`}
                        </div>
                    </div>

                    {/* Destination */}
                    <div className="text-right w-1/4">
                        <div className="text-5xl font-black text-white tracking-tight">{flightData.destinationCode || 'DST'}</div>
                        <div className="text-slate-400 text-sm font-medium mt-1 truncate">{flightData.destination.split(',')[0]}</div>
                        <div className="text-slate-600 text-xs mt-0.5">Arrive</div>
                    </div>
                 </div>
             </div>

             {/* COST OF LIVING SECTION */}
             {flightData.costOfLiving && (
                <div className="mb-8 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative z-10">
                   <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider flex items-center gap-1.5">
                     <Coins size={12} className="text-sky-400"/> Cost of Living Index ({flightData.currency})
                   </h4>
                   <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800 border border-slate-700">
                          <Utensils size={18} className="text-amber-400 mb-1.5"/>
                          <span className="text-lg font-bold text-white">{flightData.costOfLiving.mealPrice}</span>
                          <span className="text-[10px] text-slate-500">Cheap Meal</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800 border border-slate-700">
                          <BedDouble size={18} className="text-indigo-400 mb-1.5"/>
                          <span className="text-lg font-bold text-white">{flightData.costOfLiving.hostelPrice}</span>
                          <span className="text-[10px] text-slate-500">Hostel/Night</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800 border border-slate-700">
                          <Beer size={18} className="text-yellow-400 mb-1.5"/>
                          <span className="text-lg font-bold text-white">{flightData.costOfLiving.beerPrice}</span>
                          <span className="text-[10px] text-slate-500">Local Beer</span>
                      </div>
                   </div>
                </div>
             )}

             {/* AMENITIES ROW */}
             <div className="grid grid-cols-2 gap-4 relative z-10 mt-auto">
                 <div className="flex flex-col justify-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                     <span className="text-slate-500 text-[10px] uppercase font-bold mb-1">Total Price Est.</span>
                     <span className="text-xl font-bold text-white">{flightData.averagePrice}</span>
                 </div>
                 <div className="flex flex-col justify-center p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
                     <span className="text-slate-500 text-[10px] uppercase font-bold mb-2">Amenities</span>
                     <div className="flex gap-3 text-slate-400">
                         {hasWifi && <Wifi size={16} strokeWidth={2.5} className="text-slate-300" />}
                         {hasMeal && <Coffee size={16} strokeWidth={2.5} className="text-slate-300" />}
                         {hasPower && <BatteryCharging size={16} strokeWidth={2.5} className="text-slate-300" />}
                         <Briefcase size={16} strokeWidth={2.5} className="text-slate-300" />
                     </div>
                 </div>
             </div>
             
             {/* Ticket Cutout Decorations */}
             <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
             <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-50 dark:bg-slate-800 rounded-full z-20"></div>

         </div>

         {/* RIGHT SIDE: Smart Analysis & Vibe (Light/Contrast) */}
         <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800 border-l-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col relative">
             
             <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-950 rounded-full z-10"></div>

             {/* Upper Section: Route Insights */}
             <div className="p-6 pb-2">
                 <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-amber-500" size={18} fill="currentColor" fillOpacity={1}/>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Smart Route Tips</h3>
                 </div>
                 
                 <div className="space-y-3">
                    {flightData.optimizations && flightData.optimizations.slice(0, 2).map((opt, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                            <div className="mt-0.5 shrink-0">
                                {opt.type === 'cheaper' ? <TrendingDown size={14} className="text-emerald-500"/> : 
                                 opt.type === 'faster' ? <Clock size={14} className="text-blue-500"/> :
                                 <Route size={14} className="text-purple-500"/>}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{opt.title}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{opt.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>

             {/* Smart Layover Guide (Conditional) */}
             {flightData.layoverGuide && flightData.layoverGuide.hasLayover && (
                <div className="mx-6 my-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                     <div className="flex items-center gap-2 mb-1.5">
                        <PlaneLanding size={14} className="text-indigo-500"/>
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Smart Layover: {flightData.layoverGuide.airport}</span>
                     </div>
                     <p className="text-[10px] text-indigo-600 dark:text-indigo-200 leading-relaxed">
                        {flightData.layoverGuide.suggestion}
                     </p>
                </div>
             )}

             <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

             {/* VIBE SPOTS SECTION WITH CITY MAP */}
             <div className="px-6 py-2">
                 <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-rose-500" size={16} />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Vibe Check: {flightData.destination.split(',')[0]}</h3>
                 </div>
                 
                 {/* D3 City Radar Map */}
                 {flightData.vibeSpots && flightData.vibeSpots.length > 0 && (
                     <div className="mb-4">
                         <CityMap 
                            center={flightData.destinationCoords} 
                            spots={flightData.vibeSpots}
                            cityName={flightData.destination.split(',')[0]}
                         />
                     </div>
                 )}

                 <div className="space-y-2">
                    {flightData.vibeSpots && flightData.vibeSpots.map((spot, i) => (
                        <div key={i} className="group cursor-default flex items-start gap-2">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                             <div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">{spot.name}</span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{spot.description}</p>
                             </div>
                        </div>
                    ))}
                 </div>
             </div>


             {/* Lower Section: Destination Briefing */}
             <div className="p-6 pt-2 flex-grow flex flex-col mt-auto">
                 {flightData.destinationInsights ? (
                     <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/50">
                            <div className="flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400">
                                <Plug size={12} /> <span className="text-[9px] font-bold uppercase">Plugs</span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">{flightData.destinationInsights.plugType}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/50">
                             <div className="flex items-center gap-1.5 mb-1 text-slate-500 dark:text-slate-400">
                                <Calendar size={12} /> <span className="text-[9px] font-bold uppercase">Best Time</span>
                            </div>
                            <div className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate">{flightData.destinationInsights.bestSeason}</div>
                        </div>
                     </div>
                 ) : null}

                 {/* Book Now Button */}
                 <div className="mt-2">
                    <a 
                        href={bookingUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <span>Check Real Prices</span>
                        <ArrowRight size={16} />
                    </a>
                    
                    {/* Source Links */}
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {flightSources.length > 0 ? flightSources.slice(0, 2).map((source, i) => (
                            <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" 
                            className="text-[9px] px-2 py-1 bg-white dark:bg-slate-700 rounded-md text-slate-400 hover:text-sky-500 transition-colors border border-slate-200 dark:border-slate-600 truncate max-w-[80px]">
                                {new URL(source.uri).hostname.replace('www.', '')}
                            </a>
                        )) : null}
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ResultsCard;