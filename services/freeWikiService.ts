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
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  try {
    // 使用 MediaWiki API 获取维基百科内容
    // 这是一个公开的API，不需要API密钥
    // 检测topic是否包含中文字符的正则表达式
    const containsChinese = /[一-龥]/.test(topic);
    
    // 同时判断语言和topic内容
    const baseUrl = language === 'zh' && containsChinese
      ? 'https://zh.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php';
    
    // 可以使用的免费代理选项列表
    const freeProxies = [
      // 注意：这些代理可能随时变化或不可用
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/'
    ];
    
    // 尝试使用代理或直接连接
    let finalUrl = baseUrl;
    let response;
    let currentProxyIndex = -1; // -1表示直接连接
    let attempts = 0;
    const maxAttempts = freeProxies.length + 1; // +1 表示直接连接
    
    while (attempts < maxAttempts) {
      try {
        // 如果尝试次数超过0，使用代理
        if (attempts > 0) {
          currentProxyIndex = attempts - 1;
          finalUrl = freeProxies[currentProxyIndex] + encodeURIComponent(baseUrl);
        }
        
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

        const url = finalUrl + (attempts > 0 ? '' : '?' + params.toString());
        console.log('请求URL:', url);
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
          },
          timeout: 15000 // 设置超时时间为15秒
        });
        
        if (response.ok) {
          break; // 连接成功，跳出循环
        }
      } catch (error) {
        console.log(`连接尝试 ${attempts + 1} 失败:`, error);
      }
      attempts++;
    }
    
    if (!response || !response.ok) {
      throw new Error(`无法连接到维基百科API，尝试了${attempts}种方式`);
    }

    let data;
    try {
      // 如果使用了代理，可能需要处理返回的格式
      if (currentProxyIndex >= 0) {
        // 对于某些代理，我们需要先获取文本然后解析JSON
        const text = await response.text();
        data = JSON.parse(text);
      } else {
        data = await response.json();
      }
    } catch (jsonError) {
      console.error('解析响应JSON失败:', jsonError);
      throw new Error('解析维基百科响应失败');
    }
    
    console.log('维基百科响应:', data);
    
    // 解析维基百科响应
    let content = '';
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    
    if (pageId && pages[pageId].extract) {
      content = pages[pageId].extract;
      
      // 截取第一段作为简洁定义
      // const firstParagraph = content.split('\n')[0].trim();
      const firstParagraph = content;
      
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
        ? `无法为"${topic}"生成内容: `
        : `Could not generate content for "${topic}": `;
    yield `Error: ${errorPrefix}${errorMessage}`;
    throw new Error(errorMessage);
  }
}