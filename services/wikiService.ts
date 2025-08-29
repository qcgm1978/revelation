// 统一维基服务层
// 根据是否有DeepSeek API密钥自动选择使用哪个服务

import { hasApiKey } from './deepseekService';
import * as deepseekService from './deepseekService';
import * as freeWikiService from './freeWikiService';

export interface AsciiArtData {
  art: string;
  text?: string;
}

/**
 * 流式获取定义内容
 * 根据是否有DeepSeek API密钥自动选择使用哪个服务
 * @param topic 要定义的词或术语
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 异步生成器，产生文本块
 */
export async function* streamDefinition(
  topic: string,
  language: "zh" | "en" = "zh",
  category?: string
): AsyncGenerator<string, void, undefined> {
  // 检查是否有DeepSeek API密钥
  const useDeepSeek = hasApiKey();
  
  // 根据是否有API密钥选择服务
  if (useDeepSeek) {
    yield* deepseekService.streamDefinition(topic, language, category);
  } else {
    yield* freeWikiService.streamDefinition(topic, language, category);
  }
}

/**
 * 生成单个随机单词或概念
 * 只有当有DeepSeek API密钥时才可用
 * @returns 返回一个随机单词的Promise
 */
export async function getRandomWord(): Promise<string> {
  if (hasApiKey()) {
    return deepseekService.getRandomWord();
  } else {
    // 当没有API密钥时，返回一些预定义的随机单词
    const randomWords = [
      "知识", "技术", "历史", "文化", "科学", 
      "艺术", "自然", "社会", "哲学", "创新"
    ];
    const randomIndex = Math.floor(Math.random() * randomWords.length);
    return randomWords[randomIndex];
  }
}

/**
 * 为给定主题生成ASCII艺术
 * 只有当有DeepSeek API密钥时才可用
 * @param topic 要生成艺术的主题
 * @param language 语言选择：'zh' 为中文，'en' 为英文
 * @returns 包含艺术和可选文本的对象的Promise
 */
export async function generateAsciiArt(
  topic: string,
  language: "zh" | "en" = "zh"
): Promise<AsciiArtData> {
  if (hasApiKey()) {
    return deepseekService.generateAsciiArt(topic, language);
  } else {
    // 当没有API密钥时，返回简单的ASCII艺术
    return {
      art: `  ****  \n **  ** \n*      *\n*      *\n**    **\n  ****  `,
      text: topic
    };
  }
}

// 导出DeepSeek API密钥管理函数
export { setApiKey, clearApiKey, hasApiKey } from './deepseekService';