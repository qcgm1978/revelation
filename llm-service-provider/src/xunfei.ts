
class XunfeiWebSocketParams {
  APIKey: string;
  APISecret: string;
  host: string;
  path: string;
  gpt_url: string;
  prompt: string;
  
  constructor(APIKey: string, APISecret: string, gpt_url: string, prompt: string) {
    this.APIKey = APIKey;
    this.APISecret = APISecret;
    const parsedUrl = new URL(gpt_url);
    this.host = parsedUrl.host;
    this.path = parsedUrl.pathname + parsedUrl.search;
    this.gpt_url = gpt_url;
    this.prompt = prompt;
  }

  async create_url() {
    const now = new Date();
    const date = this.format_date_time(now);

    const signature_origin = `host: ${this.host}\ndate: ${date}\nGET ${this.path} HTTP/1.1`;

   
    const signature_sha = await this.generateHmac(this.APISecret, signature_origin);
    if (!signature_sha) {
      return null;
    }
    const signature_sha_base64 = btoa(String.fromCharCode(...new Uint8Array(signature_sha)));

    const authorization_origin = `api_key="${this.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature_sha_base64}"`;
    const authorization = btoa(authorization_origin);

    const v = {
      authorization: authorization,
      date: date,
      host: this.host
    };

    const queryString = new URLSearchParams(v).toString();
    const wsUrl = `${this.gpt_url}?${queryString}`;
    return wsUrl;
  }

  async generateHmac(key: string, data: string): Promise<ArrayBuffer | null> {
    try {
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const dataData = encoder.encode(data);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, dataData);
      return signature;
    } catch (error) {
      console.error('Error generating HMAC:', error);
     
      return null;
    }
  }

  format_date_time(date: Date): string {
    return date.toUTCString();
  }
}

function on_error(error: Event) {
  console.log("### error:", error);
}

function on_close(close_status_code: number, close_msg: string) {
  console.log("### closed ###");
}

function on_open(ws: WebSocket, prompt: string) {
  const data = JSON.stringify({
    "payload": {
      "message": {
        "text": [
          {
            "role": "system",
            "content": ""
          },
          {
            "role": "user",
            "content": prompt || "请在此处输入你的问题!!!"
          }
        ]
      }
    },
    "parameter": {
      "chat": {
        "max_tokens": 32768,
        "domain": "x1",
        "top_k": 6,
        "temperature": 1.2,
        "tools": [
          {
            "web_search": {
              "search_mode": "normal",
              "enable": false
            },
            "type": "web_search"
          }
        ]
      }
    },
    "header": {
      "app_id": "7802f8ba"
    }
  });
  ws.send(data);
}

export default async function request_xunfei(api_secret: string, api_key: string, gpt_url: string, prompt: string): Promise<ReadableStreamDefaultReader<Uint8Array> | null> {
  try {
    const wsParam = new XunfeiWebSocketParams(api_key, api_secret, gpt_url, prompt);
    const wsUrl = await wsParam.create_url();
    
    
    if (!wsUrl) {
      return null;
    }
    
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => on_open(ws, wsParam.prompt);
    ws.onerror = on_error;
    ws.onclose = (event) => on_close(event.code, event.reason);

   
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    ws.onmessage = (event) => {
      try {
        const data = event.data;
        const message = JSON.parse(data);
        if (message.payload?.choices?.text?.[0]?.content) {
          const content = message.payload.choices.text[0].content;
          writer.write(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
        }
        if (message.header?.code !== 0) {
          writer.close();
          ws.close();
        }
        if (message.payload?.choices?.status === 2) {
          writer.write(encoder.encode('data: [DONE]\n\n'));
          writer.close();
          ws.close();
        }
      } catch (e) {
        console.error('Error processing message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      writer.close();
    };

    return readable.getReader();
  } catch (error) {
    console.error('Error in request_xunfei:', error);
   
    return null;
  }
}

export { request_xunfei, XunfeiWebSocketParams };
