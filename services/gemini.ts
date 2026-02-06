
import { GoogleGenAI, Type, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

// Base configuration for Gemini
const getAIClient = () => new GoogleGenAI({ apiKey: API_KEY });

export const generateStructuralAnalysis = async (prompt: string, complex: boolean = false) => {
  const ai = getAIClient();
  const model = complex ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction: "You are Himalayan Sentinel AI, a multimodal geoscience intelligence system. Analyze the provided tectonic or geological query with high scientific precision.",
    tools: [{ googleSearch: {} }]
  };

  if (complex) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeGeologicalImage = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};

export const editTectonicImage = async (base64Image: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  let imageUrl = null;
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return imageUrl;
};

export const generateTerrainVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAIClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${API_KEY}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const searchLocations = async (query: string, lat?: number, lng?: number) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: lat && lng ? {
        retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
      } : undefined
    }
  });
  return {
    text: response.text,
    places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
