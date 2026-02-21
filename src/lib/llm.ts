import type { ApiProvider } from './storage';

export interface Model {
  id: string;
  name: string;
  provider: ApiProvider;
  contextWindow?: number;
  description?: string;
}

export const PROVIDERS: { id: ApiProvider; name: string }[] = [
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
];

export const MODELS: Model[] = [
    // OpenRouter (Free)
    { id: 'openrouter/free', name: 'Auto (Free)', provider: 'openrouter', description: 'Best available free model via OpenRouter' },
    { id: 'google/gemini-2.0-flash-lite-preview-02-05:free', name: 'Gemini 2.0 Flash Lite (Free)', provider: 'openrouter', description: 'Fast and free' },
    { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Gemini 2.0 Pro (Free)', provider: 'openrouter', description: 'Powerful and free' },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'openrouter', description: 'Reasoning model' },

    // OpenAI
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Most capable model' },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'openai', description: 'Fast and cost-effective' },

    // Anthropic
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', description: 'High intelligence & coding' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', description: 'Fastest and compact' },

    // Google
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', description: 'Fast and versatile' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', description: 'High capacity reasoning' },
];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(
  provider: ApiProvider,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
    if (!apiKey) throw new Error('API Key is required');

    try {
        if (provider === 'openrouter') {
            // Map 'openrouter/free' to a specific reliable free model if needed, or rely on OpenRouter's auto routing if they support it.
            // Currently, OpenRouter doesn't have a generic "free" model ID that auto-routes to any free model.
            // We'll map it to a solid default.
            const actualModel = model === 'openrouter/free' ? 'google/gemini-2.0-flash-lite-preview-02-05:free' : model;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://marxiv.app',
                    'X-Title': 'marXiv',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: actualModel,
                    messages
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'OpenRouter API error');
            }
            const data = await response.json();
            return data.choices[0].message.content;

        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages
                })
            });
             if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'OpenAI API error');
            }
            const data = await response.json();
            return data.choices[0].message.content;

        } else if (provider === 'anthropic') {
            const systemMessage = messages.find(m => m.role === 'system');
            const userMessages = messages.filter(m => m.role !== 'system');

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model,
                    system: systemMessage?.content,
                    messages: userMessages,
                    max_tokens: 4096
                })
            });
             if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Anthropic API error');
            }
            const data = await response.json();
            return (data.content[0] as any).text;

        } else if (provider === 'google') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const contents = messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            const systemMessage = messages.find(m => m.role === 'system');
            const body: any = { contents };

            if (systemMessage) {
                body.system_instruction = { parts: [{ text: systemMessage.content }] };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
             if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Google API error');
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }

        throw new Error('Unsupported provider');
    } catch (e: any) {
        console.error("LLM Chat Error", e);
        throw e;
    }
}
