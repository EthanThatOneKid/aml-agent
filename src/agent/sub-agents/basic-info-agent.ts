import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  INVESTIGATION_INSTRUCTION,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "../prompts.ts";
import type { StepResult } from "./types.ts";

export class BasicInfoAgent {
  async run(query: string, detailsContext: string): Promise<StepResult> {
    console.log("📋 Step 1/4: Gathering basic information...");
    const start = performance.now();

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: INVESTIGATOR_SYSTEM_PROMPT,
      prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 1 - Gather Basic Information**

Search for comprehensive information about: ${query}${detailsContext}

Find:
- Full name and any aliases
- Date of birth (if available)
- Nationality
- Current or last known location
- Any other identifying information

Use web search to gather this information from multiple sources. If distinguishing details or URLs were provided, prioritize information that matches those details to ensure you're investigating the correct individual.`,
      tools: {
        googleSearch: google.tools.googleSearch({}),
      },
    });

    const durationSeconds = (performance.now() - start) / 1000;
    console.log(`✅ Step 1 completed in ${durationSeconds.toFixed(2)}s`);

    return {
      text: result.text,
      durationSeconds,
    };
  }
}
