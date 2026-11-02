import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import gamesData from "@/lib/games.json";

const ids = (gamesData as { id: string }[]).map((g) => g.id);
const idSet = new Set(ids);

export const recommendGames = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ recent: z.array(z.string().max(120)).max(12) }).parse(d))
  .handler(async ({ data }): Promise<{ ids: string[]; error?: string }> => {
    const recent = data.recent.filter((id) => idSet.has(id));
    if (!recent.length) return { ids: [] };
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ids: [], error: "Suggestions are not set up yet." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        providerOptions: { openai: { store: false, reasoningEffort: "low", forceReasoning: true } },
        output: Output.object({ schema: z.object({ picks: z.array(z.string()) }) }),
        prompt: `A player recently played these browser games: ${recent.join(", ")}.\nPick 8 games they'd enjoy next from this catalog (use exact slugs, do not repeat ones they played):\n${ids.join(", ")}`,
      });
      const out = await result.output;
      const picks = [...new Set(out.picks)].filter((id) => idSet.has(id) && !recent.includes(id)).slice(0, 8);
      return { ids: picks };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("recommend failed", e);
      return { ids: [], error: status === 402 ? "AI credits have run out." : status === 429 ? "Too busy right now, try again soon." : "Couldn't load suggestions." };
    }
  });
