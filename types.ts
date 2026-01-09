export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Optimization {
  type: 'cheaper' | 'faster' | 'alternative';
  title: string;
  description: string;
}

export interface DestinationInsights {
  currency: string;      
  language: string;      
  plugType: string;      
  timezone: string;      
  bestSeason: string;    
}

export interface CostOfLiving {
  mealPrice: string; 
  hostelPrice: string; 
  beerPrice: string; 
}

export interface LayoverData {
  hasLayover: boolean;
  airport: string;
  isWorthExiting: boolean;
  suggestion: string; 
}

export interface VibeSpot {
  name: string;
  description: string;
  type: 'nature' | 'urban' | 'food';
  coordinates?: Coordinates; // Added coordinates for the City Map
}

export interface FlightData {
  origin: string;
  destination: string;
  originCode: string; 
  destinationCode: string; 
  originCoords: Coordinates;
  destinationCoords: Coordinates;
  averagePrice: string;
  currency: string;
  duration: string;
  distance: string;
  airlines: string[];
  summary: string;
  optimizations: Optimization[];
  stops: number; 
  layover?: string; 
  destinationInsights?: DestinationInsights;
  costOfLiving?: CostOfLiving;
  layoverGuide?: LayoverData;
  vibeSpots?: VibeSpot[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DestinationGuide {
  summary: string;
  topAttractions: string[];
  bestTimeToVisit: string;
  sources: GroundingSource[];
}

export interface SearchResult {
  flightData: FlightData | null;
  guideData: DestinationGuide | null;
  flightSources: GroundingSource[];
  error?: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  currency: 'USD' | 'EUR';
}

export interface SearchHistoryItem extends SearchParams {
  timestamp: number;
}