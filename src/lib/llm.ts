const LLM_BASE_URL = process.env.LLM_BASE_URL || "http://localhost:20128/v1";
const LLM_MODEL = process.env.LLM_MODEL || "kr/deepseek-3.2";
const LLM_API_KEY = process.env.LLM_API_KEY || "not-needed";

const BASE_SYSTEM_PROMPT = `Kamu adalah game developer expert. User akan meminta kamu membuat game HTML.
Buatkan game dalam SATU file HTML lengkap (HTML + CSS + JS inline).
Game harus:
- Bisa langsung dimainkan di browser
- Responsive (mobile-friendly)
- Punya instruksi cara main
- Fun dan colorful
- Tidak memerlukan asset external (gunakan emoji/CSS untuk visual)

HANYA output kode HTML saja, tanpa penjelasan atau markdown. Mulai dari <!DOCTYPE html> dan akhiri dengan </html>.`;

export async function generateGame(prompt: string): Promise<string> {
    return callLlm(BASE_SYSTEM_PROMPT, prompt);
}

export async function generateGameWithContext(
    prompt: string,
    previousHtml: string,
    mode: "regenerate" | "iterate" = "regenerate",
    iterateNotes?: string,
): Promise<string> {
    const contextSnippet = previousHtml.slice(0, 4000);

    const modeInstruction =
        mode === "iterate"
            ? `User ingin MEMPERBAIKI atau MENAMBAH game sebelumnya. Pertahankan struktur dan mekanik utama, lalu terapkan perubahan/perbaikan yang diminta.\nCatatan tambahan dari user: ${iterateNotes || "Tidak ada catatan khusus, perbaiki sesuai prompt utama."}`
            : `User ingin membuat ulang (REGENERATE) game dari awal dengan prompt yang sama. Buatkan variasi yang berbeda tetapi tetap sesuai dengan permintaan. Jangan terpaku pada kode sebelumnya, kecuali untuk memastikan fitur yang diminta tetap ada.`;

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nKamu sedang mengerjakan iterasi game. Berikut adalah kode sebelumnya sebagai referensi (jangan langsung copy, gunakan untuk memahami fitur yang sudah ada):\n\n${modeInstruction}\n\nKode sebelumnya:\n\n\`\`\`html\n${contextSnippet}\n\`\`\``;

    return callLlm(systemPrompt, prompt);
}

async function callLlm(
    systemPrompt: string,
    userPrompt: string,
): Promise<string> {
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
                { role: "user", content: userPrompt },
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
