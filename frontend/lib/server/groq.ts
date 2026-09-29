export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatOptions {
  messages: GroqChatMessage[];
  jsonMode?: boolean;
  temperature?: number;
  model?: string;
}

export async function callGroqChat(options: GroqChatOptions): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  const primaryModel = options.model || process.env.LLM_PRIMARY || 'llama-3.3-70b-versatile';
  const fallbackModel = process.env.LLM_FALLBACK || 'llama-3.1-8b-instant';

  // Helper to call Groq endpoint
  const attemptCall = async (modelName: string): Promise<string> => {
    const payload: Record<string, unknown> = {
      model: modelName,
      messages: options.messages,
      temperature: options.temperature ?? 0.2,
    };

    if (options.jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Groq API error (${res.status} on model ${modelName}): ${errText}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty response');
    }
    return content;
  };

  try {
    return await attemptCall(primaryModel);
  } catch (err) {
    console.warn(`Primary model (${primaryModel}) failed, falling back to ${fallbackModel}:`, err);
    try {
      return await attemptCall(fallbackModel);
    } catch (fallbackErr) {
      console.error(`Fallback model (${fallbackModel}) also failed:`, fallbackErr);
      return null;
    }
  }
}
