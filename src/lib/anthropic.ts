import { ANTHROPIC_API_URL, ANTHROPIC_VERSION } from '@/config/models';

/**
 * Minimal Anthropic Messages API client, called directly from the browser
 * (BYOK, spec §2). Streaming drafting calls arrive in Phase 3; Phase 1 needs
 * only the non-streaming test-connection call for Settings.
 *
 * The user's key is passed per-call from local settings — never bundled,
 * never sent anywhere but api.anthropic.com.
 */

export interface AnthropicError extends Error {
  status?: number;
  type?: string;
}

function makeError(message: string, status?: number, type?: string): AnthropicError {
  const err = new Error(message) as AnthropicError;
  err.status = status;
  err.type = type;
  return err;
}

/** Turn an HTTP failure into a human-readable message (spec §6). */
function describeFailure(status: number, body: unknown): string {
  const apiMessage =
    body && typeof body === 'object' && 'error' in body
      ? (body as { error?: { message?: string } }).error?.message
      : undefined;
  switch (status) {
    case 401:
    case 403:
      return 'Your API key was rejected. Check it in Settings — it should start with "sk-ant-".';
    case 429:
      return apiMessage ?? 'Rate limited by Anthropic. Wait a moment and try again.';
    case 400:
      return apiMessage ?? 'The request was rejected as invalid.';
    case 500:
    case 529:
      return 'Anthropic is overloaded right now. Try again shortly.';
    default:
      return apiMessage ?? `Request failed (HTTP ${status}).`;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

export interface TestConnectionResult {
  ok: boolean;
  model?: string;
  message: string;
}

/**
 * Fire a tiny message to verify the key works. Returns a friendly result
 * rather than throwing, so Settings can render it inline.
 */
export async function testConnection(
  apiKey: string,
  model: string,
): Promise<TestConnectionResult> {
  const key = apiKey.trim();
  if (!key) {
    return { ok: false, message: 'Enter an API key first.' };
  }
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
      }),
    });

    if (!res.ok) {
      const body = await parseBody(res);
      return { ok: false, message: describeFailure(res.status, body) };
    }

    return { ok: true, model, message: 'Connection successful — your key works.' };
  } catch (err) {
    // Network error (offline, DNS, CORS) — surfaced verbatim-ish per §6.
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Could not reach Anthropic. Check your connection. (${detail})`,
    };
  }
}

/** Sleep helper for backoff. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface MessageRequest {
  apiKey: string;
  model: string;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  maxTokens: number;
}

export interface MessageResult {
  text: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}

/**
 * Non-streaming message call with exponential backoff on 429/529 (max 3),
 * per spec §6. Streaming variant lands in Phase 3.
 */
export async function sendMessage(req: MessageRequest): Promise<MessageResult> {
  const key = req.apiKey.trim();
  if (!key) throw makeError('No API key set. Add one in Settings.', 401);

  const maxAttempts = 3;
  let lastError: AnthropicError | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let res: Response;
    try {
      res = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: req.model,
          max_tokens: req.maxTokens,
          system: req.system,
          messages: req.messages,
        }),
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw makeError(`Could not reach Anthropic. (${detail})`);
    }

    if (res.ok) {
      const data = (await res.json()) as {
        content: { type: string; text?: string }[];
        model: string;
        usage?: { input_tokens: number; output_tokens: number };
      };
      const text = data.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('');
      return {
        text,
        model: data.model,
        tokensIn: data.usage?.input_tokens ?? 0,
        tokensOut: data.usage?.output_tokens ?? 0,
      };
    }

    const body = await parseBody(res);
    lastError = makeError(describeFailure(res.status, body), res.status);

    // Only retry the transient statuses.
    if ((res.status === 429 || res.status === 529) && attempt < maxAttempts - 1) {
      await sleep(2 ** attempt * 1000);
      continue;
    }
    throw lastError;
  }

  throw lastError ?? makeError('Request failed.');
}
