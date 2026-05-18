const LLM_BASE_URL = process.env.LLM_BASE_URL || "http://localhost:20128/v1";
const LLM_MODEL = process.env.LLM_MODEL || "kr/deepseek-3.2";
const LLM_API_KEY = process.env.LLM_API_KEY || "not-needed";

export async function generateGame(prompt: string): Promise<string> {
  const systemPrompt = `Kamu adalah game developer expert. User akan meminta kamu membuat game HTML.
Buatkan game dalam SATU file HTML lengkap (HTML + CSS + JS inline).
Game harus:
- Bisa langsung dimainkan di browser
- Responsive (mobile-friendly)
- Punya instruksi cara main
- Fun dan colorful
- Tidak memerlukan asset external (gunakan emoji/CSS untuk visual)

HANYA output kode HTML saja, tanpa penjelasan atau markdown. Mulai dari <!DOCTYPE html> dan akhiri dengan </html>.`;

  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM API error: ${res.status}`);
  }

  const data = await res.json();
  let content = data.choices[0].message.content;

  // Strip markdown code blocks if present
  content = content.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "");

  return content;
}
