/**
 * Direct-from-browser Arabic translation via the Anthropic Messages API.
 *
 * NOTE (security): VITE_TRANSLATION_API_KEY is inlined into the built client bundle at compile
 * time, so this key is visible to anyone who opens the deployed app's dev tools. That exposure
 * was a deliberate, explicit call by the project owner (a backend proxy was offered and declined)
 * — do not "fix" this by silently changing the wiring without checking with them first.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

const cache = new Map();

async function translateToArabic(text) {
  const value = String(text ?? "").trim();
  if (!value) return value;
  if (cache.has(value)) return cache.get(value);

  const apiKey = import.meta.env.VITE_TRANSLATION_API_KEY;
  if (!apiKey) return value;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 64,
        messages: [
          {
            role: "user",
            content:
              "Translate or transliterate the following maritime document field value into Arabic. " +
              "Proper nouns (ship names, company names) should be phonetically transliterated into " +
              "Arabic script; common words or phrases should be translated naturally. Reply with ONLY " +
              `the Arabic text, nothing else.\n\nText: ${value}`,
          },
        ],
      }),
    });

    if (!res.ok) return value;

    const data = await res.json();
    const translated = data?.content?.[0]?.text?.trim();
    if (!translated) return value;

    cache.set(value, translated);
    return translated;
  } catch {
    return value;
  }
}

export default { translateToArabic };
