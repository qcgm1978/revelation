import { generatePrompt } from './llmService'
import queryString from 'query-string'
import { SSE } from 'sse.js'
import { v4 as uuidv4 } from 'uuid'

const YOUCHAT_API_URL = 'https://you.com/api/streamingSearch'

function getApiKey (): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedApiKey = localStorage.getItem('YOUCHAT_API_KEY')
    if (savedApiKey) {
      return savedApiKey
    }
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env.YOUCHAT_API_KEY
  }

  return undefined
}

export function setApiKey (apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('YOUCHAT_API_KEY', apiKey)
  }
}

export function clearApiKey (): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('YOUCHAT_API_KEY')
  }
}

export function hasApiKey (): boolean {
  return true
}

interface ChatMessage {
  question: string;
  answer: string;
}

let chatContext = {
  chatId: uuidv4(),
  chatHistory: [] as ChatMessage[]
}

function getChatContext () {
  return chatContext
}

function setChatContext (context: typeof chatContext) {
  chatContext = context
}

export async function* streamDefinition (
  topic: string,
  language: 'zh' | 'en' = 'zh',
  category?: string,
  context?: string
): AsyncGenerator<string, void, undefined> {
  const prompt = generatePrompt(topic, language, category, context)
  const contextData = getChatContext()
  let text = ''

  try {
    const queue: string[] = []
    let isDone = false
    let resolvePromise: (() => void) | null = null
    
    const streamPromise = new Promise<void>((resolve, reject) => {
      resolvePromise = resolve;
      try {
        const headers = {
          accept: 'text/event-stream',
        }
        const payload = {
          q: prompt,
          domain: 'youchat',
          chatId: contextData.chatId,
          queryTraceId: contextData.chatId,
          chat: JSON.stringify(contextData.chatHistory),
        }

        const source = new SSE(
          `${YOUCHAT_API_URL}?${queryString.stringify(payload)}`,
          {
            headers,
            withCredentials: false,
          }
        )

        source.addEventListener('youChatToken', (event: Event) => {
          try {
            const data = JSON.parse((event as MessageEvent).data)
            if (data.youChatToken) {
              text += data.youChatToken
              queue.push(data.youChatToken)
            }
          } catch (e) {}
        })

        source.addEventListener('done', () => {
          setChatContext({
            chatId: contextData.chatId,
            chatHistory: [
              ...contextData.chatHistory,
              {
                question: prompt,
                answer: text,
              },
            ],
          })
          isDone = true
          if (resolvePromise) resolvePromise();
        })

        source.addEventListener('error', (event: Event) => {
          console.error(event)
          reject(event)
        })

        source.stream()
      } catch (err) {
        reject(err)
      }
    })

    while (!isDone || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    await streamPromise;

  } catch (error) {
    console.error('Error streaming from YouChat:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.'
    const msg = language === 'zh' ? '请检查网络连接或稍后再试' : 'Please check your network connection or try again later'
    yield `Error: ${errorMessage}. ${msg}`
    throw new Error(errorMessage)
  }
}
