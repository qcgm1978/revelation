
import {GoogleGenAI} from '@google/genai';

// 在浏览器环境中，我们不能直接访问process.env
// 改为从localStorage中获取API密钥
let apiKey: string | null = null;

// 尝试从localStorage获取API密钥
if (typeof window !== 'undefined') {
  apiKey = localStorage.getItem('GEMINI_API_KEY');
}

// 这个检查是为了开发时的反馈
if (!apiKey) {
  console.warn(
    'GEMINI_API_KEY is not configured. The application will not be able to connect to the Gemini API.',
  );
}

// 初始化GoogleGenAI客户端
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({apiKey: apiKey});
}

const artModelName = 'gemini-2.5-flash';
const textModelName = 'gemini-2.5-flash-lite';

// 导出接口
export interface AsciiArtData {
  art: string;
  text?: string;
}

/**
 * 从localStorage更新API密钥
 */
export const updateApiKey = (newApiKey: string | null): void => {
  apiKey = newApiKey;
  if (newApiKey) {
    ai = new GoogleGenAI({apiKey: newApiKey});
  } else {
    ai = null;
  }
};

/**
 * 流式获取定义内容
 * @param topic 要定义的词或术语
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 异步生成器，产生文本块
 */
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh"
): AsyncGenerator<string, void, undefined> {
  if (!ai) {
    yield 'Error: GEMINI_API_KEY is not configured. Please check your settings to continue.';
    return;
  }

  // 根据语言选择生成不同的提示词
  const languagePrompt = language === 'zh' 
    ? '请用中文提供' 
    : 'Please provide in English';

  const prompt = `${languagePrompt}一个简洁的、百科全书式的定义，关于术语: "${topic}"。请提供信息丰富且中立的内容。不要使用markdown、标题或任何特殊格式。只返回定义本身的文本。`;

  try {
    const response = await ai.models.generateContentStream({
      model: textModelName,
      contents: prompt,
      config: {
        // Disable thinking for the lowest possible latency
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini:', error);
    const errorMessage = 
      error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}

/**
 * 生成单个随机单词或概念
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 返回一个随机单词的Promise
 */
export async function getRandomWord(language: "zh" | "en" = "zh"): Promise<string> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  // 根据语言选择生成不同的提示词
  const languagePrompt = language === 'zh' 
    ? '生成一个随机、有趣的中文词汇或双词概念。可以是名词、动词、形容词或专有名词。只返回词汇或概念本身，不要附加任何额外文本、标点或格式。'
    : 'Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.';

  try {
    const response = await ai.models.generateContent({
      model: textModelName,
      contents: languagePrompt,
      config: {
        // Disable thinking for low latency
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

/**
 * 为给定主题生成ASCII艺术
 * @param topic 要生成艺术的主题
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 包含艺术和可选文本的对象的Promise
 */
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

  // 根据语言选择生成不同的提示词
  const languagePrompt = language === 'zh' ? '请用中文' : 'Please use English';
  
  const prompt = `${languagePrompt}为"${topic}"创建一个包含${keysDescription}的JSON对象。
${promptBody}

只返回原始的JSON对象，不要附加任何额外文本。响应必须以"{"开头并以"}"结尾，且只包含art属性。`;

  const maxRetries = 1;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 构建配置对象
      const config: any = {
        responseMimeType: 'application/json',
      };
      
      const response = await ai.models.generateContent({
        model: artModelName,
        contents: prompt,
        config: config,
      });

      let jsonStr = response.text.trim();
      
      // 移除任何markdown代码围栏
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }

      // 确保字符串以{开头，以}结尾
      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }

      const parsedData = JSON.parse(jsonStr) as AsciiArtData;
      
      // 验证响应结构
      if (typeof parsedData.art !== 'string' || parsedData.art.trim().length === 0) {
        throw new Error('Invalid or empty ASCII art in response');
      }
      
      // 返回结果
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
