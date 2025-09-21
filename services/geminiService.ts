import {GoogleGenAI} from '@google/genai';
import { generatePrompt } from './wikiService';



let apiKey: string | null = null;


if (typeof window !== 'undefined') {
  apiKey = localStorage.getItem('GEMINI_API_KEY');
}


if (!apiKey) {
  console.warn(
    'GEMINI_API_KEY is not configured. The application will not be able to connect to the Gemini API.',
  );
}


let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({apiKey: apiKey});
}

const artModelName = 'gemini-2.5-flash';
const textModelName = 'gemini-2.5-flash-lite';


export interface AsciiArtData {
  art: string;
  text?: string;
}


export const updateApiKey = (newApiKey: string | null): void => {
  apiKey = newApiKey;
  if (newApiKey) {
    ai = new GoogleGenAI({apiKey: newApiKey});
  } else {
    ai = null;
  }
};


export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  if (!ai) {
    yield 'Error: GEMINI_API_KEY is not configured. Please check your settings to continue.';
    return;
  }

  const prompt = generatePrompt(topic, language, category, context);

  try {
    const response = await ai.models.generateContentStream({
      model: textModelName,
      contents: prompt,
      config: {
       
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    const message = JSON.parse(JSON.parse(error.message).error.message).error.message;
    console.error('Error streaming from Gemini:', error);
    const errorMessage = 
      error instanceof Error ? message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}


export async function getRandomWord(language: "zh" | "en" = "zh"): Promise<string> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

 
  const languagePrompt = language === 'zh' 
    ? '生成一个随机、有趣的中文词汇或双词概念。可以是名词、动词、形容词或专有名词。只返回词汇或概念本身，不要附加任何额外文本、标点或格式。'
    : 'Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.';

  try {
    const response = await ai.models.generateContent({
      model: textModelName,
      contents: languagePrompt,
      config: {
       
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error getting random word from Gemini:', error);
    const errorMessage = 
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not get random word: ${errorMessage}`);
  }
}


export async function generateAsciiArt(
  topic: string,
  language: "zh" | "en" = "zh"
): Promise<AsciiArtData> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  
  const artPromptPart = `1. "art": meta ASCII visualization of the word "${topic}":
  - Palette: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\_|
  - Shape mirrors concept - make the visual form embody the word's essence
  - Examples: 
    * "explosion" → radiating lines from center
    * "hierarchy" → pyramid structure
    * "flow" → curved directional lines
  - Return as single string with \n for line breaks`;

  const keysDescription = `one key: "art"`;
  const promptBody = artPromptPart;

 
  const languagePrompt = language === 'zh' ? '请用中文' : 'Please use English';
  
  const prompt = `${languagePrompt}为"${topic}"创建一个包含${keysDescription}的JSON对象。
${promptBody}

只返回原始的JSON对象，不要附加任何额外文本。响应必须以"{"开头并以"}"结尾，且只包含art属性。`;

  const maxRetries = 1;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
     
      const config: any = {
        responseMimeType: 'application/json',
      };
      
      const response = await ai.models.generateContent({
        model: artModelName,
        contents: prompt,
        config: config,
      });

      let jsonStr = response.text.trim();
      
     
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }

     
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }

      const parsedData = JSON.parse(jsonStr) as AsciiArtData;
      
     
      if (typeof parsedData.art !== 'string' || parsedData.art.trim().length === 0) {
        throw new Error('Invalid or empty ASCII art in response');
      }
      
     
      const result: AsciiArtData = {
        art: parsedData.art,
      };

      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      if (attempt === maxRetries) {
        throw new Error(`Could not generate ASCII art after ${maxRetries} attempts: ${lastError.message}`);
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
