import type { ApiProvider } from './storage';

export interface Model {
  id: string;
  name: string;
  provider: ApiProvider;
  contextWindow?: number;
  description?: string;
}

export async function fetchModels(provider: ApiProvider, key: string): Promise<Model[]> {
  if (!key) return [];

  try {
    switch (provider) {
      case 'openrouter':
        return await fetchOpenRouterModels(key);
      case 'openai':
        return await fetchOpenAIModels(key);
      case 'anthropic':
        return await fetchAnthropicModels(key);
      case 'google':
        return await fetchGoogleModels(key);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Failed to fetch models for ${provider}:`, error);
    // Return empty list so the UI doesn't crash, maybe the user can try again or we show a static list
    return [];
  }
}

async function fetchOpenRouterModels(key: string): Promise<Model[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://marxiv.app',
      'X-Title': 'Marxiv',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  // OpenRouter returns a lot of data, we map it to our simple interface
  return data.data.map((m: any) => ({
    id: m.id,
    name: m.name,
    provider: 'openrouter',
    contextWindow: m.context_length,
    description: m.description,
  })).sort((a: Model, b: Model) => a.name.localeCompare(b.name));
}

async function fetchOpenAIModels(key: string): Promise<Model[]> {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Filter for chat models roughly
  const chatModels = data.data.filter((m: any) =>
    m.id.startsWith('gpt') || m.id.startsWith('o1') || m.id.startsWith('o3')
  );

  return chatModels.map((m: any) => ({
    id: m.id,
    name: m.id, // OpenAI doesn't provide pretty names in the API
    provider: 'openai',
  })).sort((a: Model, b: Model) => b.id.localeCompare(a.id)); // Newest first (rough heuristic)
}

async function fetchAnthropicModels(key: string): Promise<Model[]> {
  // Anthropic API often has strict CORS. We attempt to fetch, but fallback to a static list if it fails.
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
    });

    if (!response.ok) {
      // If 401, key is bad. If 403/Cors, maybe we fallback.
      if (response.status === 401) throw new Error("Invalid Key");
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((m: any) => ({
      id: m.id,
      name: m.display_name,
      provider: 'anthropic',
    }));

  } catch (error) {
    console.warn("Anthropic fetch failed (likely CORS), using fallback list.", error);
    // Fallback list as of early 2025
    return [
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
    ];
  }
}

async function fetchGoogleModels(key: string): Promise<Model[]> {
  // Google uses query param for API key
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);

  if (!response.ok) {
    throw new Error(`Google API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Filter for 'generateContent' capable models and exclude embedding models if possible (usually 'models/embedding-...')
  const contentModels = data.models.filter((m: any) =>
    m.supportedGenerationMethods?.includes('generateContent') && !m.name.includes('embedding')
  );

  return contentModels.map((m: any) => ({
    id: m.name.replace('models/', ''), // Remove 'models/' prefix for cleaner ID usage if desired, or keep it. Google usually expects 'models/...' but often accepts just the ID. Let's keep it clean but we might need to prepend 'models/' when calling.
    // Actually, for consistency, let's keep the full resource name or just the ID?
    // Most Google client libs take 'gemini-pro'. The API returns 'models/gemini-pro'.
    // Let's strip 'models/' for display but we might need to re-add it for calls.
    // Wait, the default I set earlier was 'google/gemini-2.0-flash-001'.
    // Let's use just the ID part.
    name: m.displayName,
    provider: 'google',
    description: m.description,
    contextWindow: m.inputTokenLimit,
  }));
}
