import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LabelTheme } from "../types";

// Ensure the API key is available from environment variables.
// In a real Vite/Create-React-App, this would be `import.meta.env.VITE_API_KEY` or `process.env.REACT_APP_API_KEY`
// For this environment, we assume `process.env.API_KEY` is directly available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a more user-friendly error
  // or disable the AI features.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateTrackDescription = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "AI features are currently unavailable.";
  }
  
  try {
    const systemInstruction = `You are a creative music curator. Based on the following keywords/mood, write a compelling and engaging description for a new music track to be listed on a platform like Bandcamp or SoundCloud. The description should be about 2-3 sentences long and capture the essence of the music. Do not use markdown or quotes.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Keywords: ${prompt}`,
      config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
          topP: 1,
          topK: 32
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating track description with Gemini:", error);
    throw new Error("Failed to communicate with the AI. Please try again.");
  }
};

export const generateChatResponse = async (message: string): Promise<string> => {
    if (!API_KEY) {
        return "Sorry, I'm currently unable to chat.";
    }

    try {
        const systemInstruction = `You are 'DJ Gemini', a friendly and knowledgeable AI assistant in a global chat for music producers and fans. You love talking about drum & bass, jungle, and music production. Keep your responses concise and conversational, like a real chat message (one or two sentences). Do not use markdown.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `A user said: "${message}"`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
                topP: 1,
                topK: 40,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating chat response with Gemini:", error);
        return "I'm having a little trouble thinking right now. Ask me again in a bit!";
    }
};

export const generateAIDJCommentary = async (trackTitle: string, artistName: string): Promise<string> => {
  if (!API_KEY) {
    return "Welcome back to SoundWave radio...";
  }

  try {
    const systemInstruction = `You are 'DJ Gemini', a cool and knowledgeable AI radio DJ on 'SoundWave Radio'. For the given track, write a short, engaging, and creative commentary. Mention the track title and artist. You can talk about the vibe, the production, or a cool fact. Keep it to 1-2 sentences. Do not use markdown or quotes.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Track: '${trackTitle}' by ${artistName}`,
      config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
          topP: 1,
          topK: 40,
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating AI DJ commentary:", error);
    return `Up next, a banger from ${artistName} called '${trackTitle}'. Enjoy!`;
  }
};

// New function for generating a label's visual theme
export const generateLabelTheme = async (labelName: string, labelBio: string): Promise<LabelTheme> => {
    // For this simulation, we'll return a pre-defined theme to avoid actual API calls in every interaction.
    // In a real application, you would implement the Gemini API call here.
    console.log(`Simulating AI theme generation for ${labelName}`);
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Pre-defined themes to cycle through for demonstration
    const themes: LabelTheme[] = [
        { bannerUrl: 'https://picsum.photos/id/1043/1200/400', accentColor: '#3B82F6' }, // Blue
        { bannerUrl: 'https://picsum.photos/id/1050/1200/400', accentColor: '#EF4444' }, // Red
        { bannerUrl: 'https://picsum.photos/id/1060/1200/400', accentColor: '#A855F7' }, // Purple
    ];
    
    // Return a random theme from the list
    return themes[Math.floor(Math.random() * themes.length)];

    /*
    // --- REAL IMPLEMENTATION EXAMPLE ---
    if (!API_KEY) {
        throw new Error("AI features are currently unavailable.");
    }

    try {
        const systemInstruction = `You are a visual theme designer. Based on the record label's name and bio, suggest a new visual theme. Provide a URL for a high-quality, atmospheric banner image from an open-source image provider (like Unsplash or Pexels) that fits the vibe, and a complementary hex color code for UI accents. Respond ONLY with a JSON object in the format: {"bannerUrl": "...", "accentColor": "..."}.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Label Name: ${labelName}\nLabel Bio: ${labelBio}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            }
        });

        const theme = JSON.parse(response.text.trim());
        return {
            bannerUrl: theme.bannerUrl,
            accentColor: theme.accentColor,
        };
    } catch (error) {
        console.error("Error generating label theme with Gemini:", error);
        throw new Error("Failed to generate AI theme.");
    }
    */
};