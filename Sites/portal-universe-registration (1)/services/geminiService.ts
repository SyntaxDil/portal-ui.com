import { GoogleGenAI } from "@google/genai";

// IMPORTANT: Make sure to set your API_KEY in the environment variables.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateAvatar = async (prompt: string): Promise<string | null> => {
    if (!API_KEY) {
        throw new Error("API Key is not configured.");
    }
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A high-quality, centered profile picture of: ${prompt}. Sci-fi, futuristic, digital art.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        return null;
    }
};
