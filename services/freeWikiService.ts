// 免费维基百科服务
// 不需要API密钥即可使用

/**
 * 流式获取维基百科定义内容
 * @param topic 要定义的词或术语
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 异步生成器，产生文本块
 */
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh"
): AsyncGenerator<string, void, undefined> {
  try {
    // 使用 MediaWiki API 获取维基百科内容
    // 这是一个公开的API，不需要API密钥
    const baseUrl = language === 'zh' 
      ? 'https://zh.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php';
    
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: topic,
      prop: 'extracts',
      exintro: 'true',
      explaintext: 'true',
      redirects: '1',
      origin: '*' // 处理CORS问题
    });

    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析维基百科响应
    let content = '';
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    
    if (pageId && pages[pageId].extract) {
      content = pages[pageId].extract;
      
      // 截取第一段作为简洁定义
      const firstParagraph = content.split('\n')[0].trim();
      
      if (firstParagraph) {
        content = firstParagraph;
      }
    }
    
    if (!content) {
      content = language === 'zh' 
        ? `抱歉，未能找到关于"${topic}"的信息。请尝试其他关键词。`
        : `Sorry, no information found for "${topic}". Please try another keyword.`;
    }
    
    // 流式返回内容（模拟流式效果）
    const chunkSize = 30;
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, 30)); // 小延迟模拟流式效果
    }
  } catch (error) {
    console.error('Error fetching from free wiki service:', error);
    const errorMessage = 
      error instanceof Error ? error.message : "An unknown error occurred.";
    const errorPrefix = 
      language === "zh"
        ? `无法为"${topic}"生成内容`
        : `Could not generate content for "${topic}"`;
    yield `Error: ${errorPrefix}. ${errorMessage}`;
    throw new Error(errorMessage);
  }
}