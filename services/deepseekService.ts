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

  const prompt = `请用中文为术语"${topic}"提供一个简洁、单段落的百科全书式定义。要求信息丰富且中立。不要使用markdown、标题或任何特殊格式。请只回复定义本身的文本内容。请确保使用中文回答。`;

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

  const prompt = `请生成一个有趣的中文词汇或概念，可以是名词、动词、形容词或专有名词。请只回复词汇或概念本身，不要额外的文字、标点符号或格式。`;

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

  const artPromptPart = `1. "art": 为词汇"${topic}"创建元ASCII可视化：
  - 调色板：│─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - 形状反映概念 - 让视觉形式体现词汇的本质
  - 示例：
    * "爆炸" → 从中心辐射的线条
    * "层次" → 金字塔结构
    * "流动" → 弯曲的方向性线条
  - 返回为单个字符串，使用\\n换行`;

  const keysDescription = `一个键："art"`;
  const promptBody = artPromptPart;

  const prompt = `为"${topic}"创建一个包含${keysDescription}的JSON对象。
${promptBody}

请只返回原始JSON对象，不要额外的文字。响应必须以"{"开始，以"}"结束，只包含art属性。`;

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
