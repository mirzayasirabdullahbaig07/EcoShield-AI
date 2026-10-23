// Server-only. The Groq key is read here and never sent to the browser.
export class AiError extends Error {
  constructor(public code: string) { super(code); }
}

const URL = "https://api.groq.com/openai/v1/chat/completions";
export const aiModel = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

async function groqJson(system: string, user: string): Promise<unknown> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AiError("no_key");
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: aiModel(), temperature: 0.2, max_tokens: 700, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (res.status === 429) throw new AiError("rate_limited");
  if (!res.ok) throw new AiError(`http_${res.status}`);
  const content = (await res.json())?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new AiError("bad_response");
  try { return JSON.parse(content); } catch { throw new AiError("bad_json"); }
}

const REASON: Record<string, string> = {
  rate_limited: "the AI service is rate-limited right now",
  bad_json: "the AI reply was not in the expected format",
  bad_response: "the AI reply was empty",
  timeout: "the AI service took too long",
};

export type AiRun<T> = { mode: "live" | "demo"; model?: string; note?: string; result: T };

/** Live Groq when a key exists; otherwise (or on failure) a clearly labelled sample built from the same facts. */
export async function runAi<T>(p: { system: string; user: string }, validate: (j: unknown) => T | null, demo: () => T): Promise<AiRun<T>> {
  if (!process.env.GROQ_API_KEY) {
    return { mode: "demo", note: "No GROQ_API_KEY is set, so this is a sample response built from the same data.", result: demo() };
  }
  try {
    const valid = validate(await groqJson(p.system, p.user));
    if (!valid) throw new AiError("bad_json");
    return { mode: "live", model: aiModel(), result: valid };
  } catch (e) {
    const code = e instanceof AiError ? e.code : e instanceof Error && e.name === "TimeoutError" ? "timeout" : "error";
    const why = REASON[code] ?? "the AI service could not be reached";
    console.error("AI call failed:", code);
    return { mode: "demo", note: `Live AI was unavailable (${why}), so this is a sample response built from the same data.`, result: demo() };
  }
}
