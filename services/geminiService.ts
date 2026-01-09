import { GoogleGenAI, Type } from "@google/genai";
import { FlightData, SearchResult, GroundingSource, SearchParams } from "../types";

// Helper to extract JSON from markdown code blocks if necessary
const extractJSON = (text: string): any => {
  try {
    // Try parsing directly
    return JSON.parse(text);
  } catch (e) {
    // Try extracting from code block
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON", e2);
      }
    }
    // Try finding first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      } catch (e3) {
        console.error("Failed to parse loose JSON", e3);
      }
    }
    throw new Error("Could not parse JSON response from Gemini");
  }
};

export const fetchFlightData = async (params: SearchParams): Promise<SearchResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const flightPrompt = `
    Find flight prices from ${params.origin} to ${params.destination}.
    
    Search Parameters:
    - Departure: ${params.departDate || "Next month"}
    - Return: ${params.returnDate || "One week later"}
    - Passengers: ${params.passengers}
    - Class: ${params.cabinClass}
    - Currency: ${params.currency} (Provide ALL prices in this currency)

    Required Information (JSON Response):
    1. Origin/Destination IATA Codes & Coordinates.
    2. Total Estimated Price Range for ${params.passengers} passenger(s).
    3. Stops & Hubs (if any).
    4. Smart Layover: Worth exiting the airport?
    5. Cost of Living (Burger Index) in ${params.currency}.
    6. Vibe Spots: 3 specific spots in the destination city with their approximate COORDINATES (lat, lng) so I can plot them on a map.
    
    IMPORTANT: You must return a valid JSON object.
  `;

  let flightData: FlightData | null = null;
  let flightSources: GroundingSource[] = [];

  try {
    const flightResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: flightPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            origin: { type: Type.STRING },
            destination: { type: Type.STRING },
            originCode: { type: Type.STRING },
            destinationCode: { type: Type.STRING },
            originCoords: { 
              type: Type.OBJECT,
              properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
            },
            destinationCoords: {
              type: Type.OBJECT,
               properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
            },
            averagePrice: { type: Type.STRING, description: "Total price range with currency symbol" },
            currency: { type: Type.STRING },
            duration: { type: Type.STRING },
            distance: { type: Type.STRING },
            airlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            stops: { type: Type.NUMBER },
            layover: { type: Type.STRING },
            summary: { type: Type.STRING },
            optimizations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['cheaper', 'faster', 'alternative'] },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING }
                    }
                }
            },
            destinationInsights: {
              type: Type.OBJECT,
              properties: {
                currency: { type: Type.STRING },
                language: { type: Type.STRING },
                plugType: { type: Type.STRING },
                timezone: { type: Type.STRING },
                bestSeason: { type: Type.STRING }
              }
            },
            costOfLiving: {
                type: Type.OBJECT,
                properties: {
                    mealPrice: { type: Type.STRING },
                    hostelPrice: { type: Type.STRING },
                    beerPrice: { type: Type.STRING }
                }
            },
            layoverGuide: {
                type: Type.OBJECT,
                properties: {
                    hasLayover: { type: Type.BOOLEAN },
                    airport: { type: Type.STRING },
                    isWorthExiting: { type: Type.BOOLEAN },
                    suggestion: { type: Type.STRING }
                }
            },
            vibeSpots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['nature', 'urban', 'food'] },
                        coordinates: {
                            type: Type.OBJECT,
                            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } }
                        }
                    }
                }
            }
          }
        }
      }
    });

    const flightText = flightResponse.text;
    console.log("Flight Raw Response:", flightText);
    
    const chunks = flightResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          flightSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    if (flightText) {
       flightData = extractJSON(flightText);
    } else {
       throw new Error("Empty response from AI model");
    }

  } catch (error) {
    console.error("Error fetching flight data:", error);
    return { flightData: null, guideData: null, flightSources: [], error: "Could not retrieve flight data. Please try again or check your connection." };
  }

  return {
    flightData,
    guideData: null,
    flightSources
  };
};