// DeepSeek API 服务
// 免费额度：每天1000次请求，每分钟60次请求

export interface AsciiArtData {
  art: string;
  text?: string;
}

// DeepSeek API 配置
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat"; // 免费模型

// 检查环境变量
if (!process.env.DEEPSEEK_API_KEY) {
  console.error(
    "DEEPSEEK_API_KEY environment variable is not set. The application will not be able to connect to the DeepSeek API."
  );
}

/**
 * 流式获取定义内容
 * @param topic 要定义的词或术语
 * @returns 异步生成器，产生文本块
 */
export async function* streamDefinition(
  topic: string
): AsyncGenerator<string, void, undefined> {
  if (!process.env.DEEPSEEK_API_KEY) {
    yield "Error: DEEPSEEK_API_KEY is not configured. Please check your environment variables to continue.";
    return;
  }

  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                yield parsed.choices[0].delta.content;
              }
            } catch (e) {
              // 忽略解析错误，继续处理
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Error streaming from DeepSeek:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}

/**
 * 生成单个随机单词或概念
 * @returns 返回一个随机单词的Promise
 */
export async function getRandomWord(): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const prompt = `Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error getting random word from DeepSeek:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Could not get random word: ${errorMessage}`);
  }
}

/**
 * 为给定主题生成ASCII艺术
 * @param topic 要生成艺术的主题
 * @returns 包含艺术和可选文本的对象的Promise
 */
export async function generateAsciiArt(topic: string): Promise<AsciiArtData> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const artPromptPart = `1. "art": meta ASCII visualization of the word "${topic}":
  - Palette: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - Shape mirrors concept - make the visual form embody the word's essence
  - Examples: 
    * "explosion" → radiating lines from center
    * "hierarchy" → pyramid structure
    * "flow" → curved directional lines
  - Return as single string with \\n for line breaks`;

  const keysDescription = `one key: "art"`;
  const promptBody = artPromptPart;

  const prompt = `For "${topic}", create a JSON object with ${keysDescription}.
${promptBody}

Return ONLY the raw JSON object, no additional text. The response must start with "{" and end with "}" and contain only the art property.`;

  const maxRetries = 1;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          stream: false,
          max_tokens: 1000,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let jsonStr = data.choices?.[0]?.message?.content?.trim() || "";

      // Debug logging
      console.log(
        `Attempt ${attempt}/${maxRetries} - Raw API response:`,
        jsonStr
      );

      // Remove any markdown code fences if present
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }

      // Ensure the string starts with { and ends with }
      if (!jsonStr.startsWith("{") || !jsonStr.endsWith("}")) {
        throw new Error("Response is not a valid JSON object");
      }

      const parsedData = JSON.parse(jsonStr) as AsciiArtData;

      // Validate the response structure
      if (
        typeof parsedData.art !== "string" ||
        parsedData.art.trim().length === 0
      ) {
        throw new Error("Invalid or empty ASCII art in response");
      }

      // If we get here, the validation passed
      const result: AsciiArtData = {
        art: parsedData.art,
      };

      if (parsedData.text) {
        result.text = parsedData.text;
      }

      return result;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown error occurred");
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      );

      if (attempt === maxRetries) {
        console.error("All retry attempts failed for ASCII art generation");
        throw new Error(
          `Could not generate ASCII art after ${maxRetries} attempts: ${lastError.message}`
        );
      }
      // Continue to next attempt
    }
  }

  // This should never be reached, but just in case
  throw lastError || new Error("All retry attempts failed");
}
