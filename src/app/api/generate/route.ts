import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateGame, generateGameWithContext } from "@/lib/llm";
import { deductCredits, CREDIT_CONFIG } from "@/lib/credits";
import { sanitizePrompt } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "Login diperlukan" },
            { status: 401 },
        );
    }

    const rateLimit = checkRateLimit(session.user.email, "GENERATE");
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: "Terlalu banyak request. Tunggu sebentar." },
            { status: 429 },
        );
    }

    const { prompt, isRegenerate, previousHtml, mode, iterateNotes } =
        await req.json();

    if (!prompt || typeof prompt !== "string") {
        return NextResponse.json(
            { error: "Prompt diperlukan" },
            { status: 400 },
        );
    }

    const cleanPrompt = sanitizePrompt(prompt);

    const generateMode =
        mode === "iterate"
            ? "iterate"
            : isRegenerate
              ? "regenerate"
              : "generate";
    const cost =
        generateMode === "iterate"
            ? CREDIT_CONFIG.COST_ITERATE
            : generateMode === "regenerate"
              ? CREDIT_CONFIG.COST_REGENERATE
              : CREDIT_CONFIG.COST_GENERATE;

    const deduction = await deductCredits(session.user.email, cost);

    if (!deduction.success) {
        return NextResponse.json(
            { error: deduction.error, credits: deduction.credits },
            { status: 402 },
        );
    }

    try {
        let html: string;
        if (
            generateMode === "iterate" &&
            previousHtml &&
            typeof previousHtml === "string"
        ) {
            html = await generateGameWithContext(
                cleanPrompt,
                previousHtml,
                "iterate",
                iterateNotes,
            );
        } else if (
            generateMode === "regenerate" &&
            previousHtml &&
            typeof previousHtml === "string"
        ) {
            html = await generateGameWithContext(
                cleanPrompt,
                previousHtml,
                "regenerate",
            );
        } else {
            html = await generateGame(cleanPrompt);
        }
        return NextResponse.json({
            html,
            credits: deduction.credits,
            remaining: rateLimit.remaining,
            mode: generateMode,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Gagal generate game";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
