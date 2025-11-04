
import { GoogleGenAI, Type } from "@google/genai";
import { SectorType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 3; // Fewer retries
const INITIAL_BACKOFF_MS = 5000; // Increased initial backoff to 5 seconds

// Helper function for delaying execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const geminiRequest = async <T>(prompt: string, config?: any): Promise<T | null> => {
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config,
            });
            if (config?.responseMimeType === 'application/json') {
                const textResponse = response.text.trim();
                // Defensive check to ensure the response is valid JSON before parsing
                if (textResponse.startsWith('{') || textResponse.startsWith('[')) {
                    return JSON.parse(textResponse) as T;
                } else {
                    console.error("Gemini API returned a non-JSON response when JSON was expected.", textResponse);
                    lastError = new Error("Invalid JSON response from API");
                    break;
                }
            }
            return response.text as T;
        } catch (error) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            if (errorMessage.includes("429") || errorMessage.toUpperCase().includes("RESOURCE_EXHAUSTED")) {
                if (attempt === MAX_RETRIES) break;
                const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.warn(`Rate limit exceeded. Attempt ${attempt}/${MAX_RETRIES}. Retrying in ${Math.round(backoffTime / 1000)}s...`);
                await sleep(backoffTime);
            } else {
                console.error("A non-retriable Gemini API error occurred:", error);
                break;
            }
        }
    }

    if (lastError) {
        console.error(`Gemini API request failed after ${MAX_RETRIES} attempts. This may be due to API key quota limits or network issues. Please check your Gemini API dashboard.`);
        console.error("Last recorded error:", lastError);
    }
    
    return null;
}


export const generateSectorEvent = async (sectorType: SectorType, x: number, y: number): Promise<string> => {
  const prompt = `
    You are a sci-fi game master for a game called "Soul Ship Voyager".
    The starship 'Odyssey', carrying the last 5000 human souls, has just arrived at coordinates [${x}, ${y}].
    This sector of space contains a: ${sectorType}.

    Describe what the ship's sensors pick up or what the crew observes.
    The description should be a single, immersive paragraph of 2-3 sentences.
    The tone should be a mix of wonder, mystery, and a hint of foreboding.
    Do not ask a question or present a choice. Just set the scene.
  `;
    const result = await geminiRequest<string>(prompt);
    return result || "The ship's long-range comms are experiencing severe subspace interference after multiple failed attempts to scan the sector. The crew remains on high alert.";
};

export const generateInteractiveEvent = async (): Promise<{ description: string; choices: string[] } | null> => {
    const prompt = `
        You are a sci-fi game master for the game "Soul Ship Voyager". The starship Odyssey is traveling through an unknown region of deep space.
        Generate a random, mysterious event that requires a decision from the captain.
        The event description should be a single, immersive paragraph (2-3 sentences).
        Provide two distinct, concise choices for the player (2-4 words each).
        
        Format the output as a JSON object.
    `;
    return geminiRequest<{ description: string; choices: string[] }>(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                choices: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ['description', 'choices']
        }
    });
};

export const resolveEventChoice = async (eventDescription: string, choice: string): Promise<{ outcome: string; effects: { hull?: number; energy?: number; resources?: number; souls?: number; } } | null> => {
    const prompt = `
      You are a sci-fi game master for "Soul Ship Voyager".
      The captain of the starship Odyssey faced this situation: "${eventDescription}".
      They made the decision to: "${choice}".

      Describe the outcome of their decision in a single, immersive paragraph.
      Then, determine the gameplay consequences. The consequences can be positive, negative, or neutral.
      
      Effects must be small integer changes. For example: hull: -5, resources: 10, energy: -2.
      Souls should only be affected in very rare, impactful situations.

      Format the output as a JSON object.
    `;
    return geminiRequest<{ outcome: string; effects: { hull?: number; energy?: number; resources?: number; souls?: number; } }>(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                outcome: { type: Type.STRING },
                effects: {
                    type: Type.OBJECT,
                    properties: {
                        hull: { type: Type.INTEGER, description: "Change in hull integrity." },
                        energy: { type: Type.INTEGER, description: "Change in energy reserves." },
                        resources: { type: Type.INTEGER, description: "Change in resources." },
                        souls: { type: Type.INTEGER, description: "Change in souls aboard." }
                    }
                }
            },
            required: ['outcome', 'effects']
        }
    });
};

export const generateScanResult = async (sectorType: SectorType): Promise<{ description: string; effects: { resources?: number; energy?: number; hull?: number } } | null> => {
    const prompt = `
      You are a sci-fi game master for "Soul Ship Voyager".
      The starship Odyssey has performed a deep scan on its current sector, which is a ${sectorType}.
      Describe the detailed findings of the scan in an immersive paragraph.
      The scan could reveal a small deposit of resources, a minor energy source, a hidden danger that causes a tiny bit of hull damage, or simply find nothing of note.
      
      Determine the gameplay consequences of the scan. Effects should be small integer changes.
      For example: resources: 5, energy: 3, hull: -2. Finding nothing is also a valid outcome (empty effects object).

      Format the output as a JSON object.
    `;
    return geminiRequest<{ description: string; effects: { resources?: number; energy?: number; hull?: number } }>(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                effects: {
                    type: Type.OBJECT,
                    properties: {
                        resources: { type: Type.INTEGER, description: "Change in resources." },
                        energy: { type: Type.INTEGER, description: "Change in energy reserves." },
                        hull: { type: Type.INTEGER, description: "Change in hull integrity due to a hazard." }
                    }
                }
            },
            required: ['description', 'effects']
        }
    });
};
