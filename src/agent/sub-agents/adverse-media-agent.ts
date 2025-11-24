import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  INVESTIGATION_INSTRUCTION,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "../prompts.ts";
import type { StepResult } from "./types.ts";

export class AdverseMediaAgent {
  async run(
    query: string,
    basicInfoText: string,
    detailsContext: string,
  ): Promise<StepResult> {
    console.log("📰 Step 2/4: Checking adverse media...");
    const start = performance.now();

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: INVESTIGATOR_SYSTEM_PROMPT,
      prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 2 - Adverse Media Check**

Based on the following information about ${query}:
${basicInfoText}${detailsContext}

Search for adverse media (negative news, criminal activity, financial crimes, fraud, corruption, etc.) about this individual. Use the distinguishing details to ensure you're investigating the correct person, especially if the name is common.

Search:
- News articles mentioning this person
- Social media posts
- Public records
- Web sources

For each finding, document:
- Source (publication, website, etc.)
- Title or description
- Date (if available)
- Relevance level (high/medium/low)
- Summary of the finding

Be thorough but also verify relevance - avoid false positives from common names.`,
      tools: {
        googleSearch: google.tools.googleSearch({}),
      },
    });

    const durationSeconds = (performance.now() - start) / 1000;
    console.log(`✅ Step 2 completed in ${durationSeconds.toFixed(2)}s`);

    return {
      text: result.text,
      durationSeconds,
    };
  }
}
