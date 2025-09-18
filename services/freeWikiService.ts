// https://openrouter.ai/models
import { generatePrompt } from './wikiService';

export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  try {
    try {
      const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
      
      const MODEL = language === 'zh' ? 
        'deepseek/deepseek-r1:free' : 
        'microsoft/mai-ds-r1:free';
      
      const prompt = generatePrompt(topic, language, category, context);
      
      let accumulatedContent = '';
      
      let authToken = 'Bearer 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';
      let response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          max_tokens: 500,
          temperature: 0.7
        }),
        timeout: 20000
      });
      
      if (!response.ok && response.status === 401) {
        authToken = 'Bearer guest';
        response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true,
            max_tokens: 500,
            temperature: 0.7
          }),
          timeout: 20000
        });
      }
      
      if (response.ok) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  if (accumulatedContent) {
                    yield accumulatedContent;
                    accumulatedContent = '';
                  }
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    accumulatedContent += parsed.choices[0].delta.content;
                    if (accumulatedContent.length >= 30) {
                      yield accumulatedContent;
                      accumulatedContent = '';
                    }
                  }
                } catch (e) {}
              }
            }
          }
        } finally {
          if (accumulatedContent) {
            yield accumulatedContent;
          }
          reader.releaseLock();
        }
        return;
      }
    } catch (openRouterError) {
      console.warn('OpenRouter请求失败，使用维基百科API作为备选方案:', openRouterError);
    }
    
    const containsChinese = /[一-龥]/.test(topic);
    
    const baseUrl = language === 'zh' && containsChinese
      ? 'https://zh.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php';
    
    const freeProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/'
    ];
    
    let finalUrl = baseUrl;
    let response;
    let currentProxyIndex = -1;
    let attempts = 0;
    const maxAttempts = freeProxies.length + 1;
    
    while (attempts < maxAttempts) {
      try {
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
          origin: '*'
        });

        const url = finalUrl + (attempts > 0 ? '' : '?' + params.toString());
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
          },
          timeout: 15000
        });
        
        if (response.ok) {
          break;
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
      if (currentProxyIndex >= 0) {
        const text = await response.text();
        data = JSON.parse(text);
      } else {
        data = await response.json();
      }
    } catch (jsonError) {
      console.error('解析响应JSON失败:', jsonError);
      throw new Error('解析维基百科响应失败');
    }
    
    let content = '';
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    
    if (pageId && pages[pageId].extract) {
      content = pages[pageId].extract;
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
    
    const chunkSize = 30;
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, 30));
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