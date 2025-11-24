import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { amlAPIManager } from "../aml-apis/index.ts";
import {
  INVESTIGATION_INSTRUCTION,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "../prompts.ts";
import type { PepAgentResult } from "./types.ts";

function extractIdentifiers(
  basicInfoText: string,
): { dateOfBirth?: string; nationality?: string; location?: string } {
  const dobMatch = basicInfoText.match(/Date of Birth[:\s]+([^\n]+)/i);
  const nationalityMatch = basicInfoText.match(/Nationality[:\s]+([^\n]+)/i);
  const locationMatch = basicInfoText.match(/Location[:\s]+([^\n]+)/i);

  return {
    dateOfBirth: dobMatch?.[1]?.trim(),
    nationality: nationalityMatch?.[1]?.trim(),
    location: locationMatch?.[1]?.trim(),
  };
}

export class PepAgent {
  constructor(
    private readonly apiManager: typeof amlAPIManager = amlAPIManager,
  ) {}

  async run(
    query: string,
    basicInfoText: string,
    detailsContext: string,
  ): Promise<PepAgentResult> {
    console.log("🏛️  Step 3/4: Screening for PEP status...");
    const start = performance.now();

    const identifiers = extractIdentifiers(basicInfoText);
    const matches = await this.apiManager.searchPEP({
      name: query,
      ...identifiers,
    });

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: INVESTIGATOR_SYSTEM_PROMPT,
      prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 3 - PEP Screening**

Based on the following information about ${query}:
${basicInfoText}${detailsContext}

**PEP Database Search Results:**
${
        matches.length > 0
          ? matches.map((m) =>
            `- Name: ${m.name}\n  Position: ${m.position}\n  Country: ${m.country}${
              m.dates ? `\n  Dates: ${m.dates}` : ""
            }\n  Source: ${m.source}`
          ).join("\n\n")
          : "No PEP matches found in database searches."
      }

**IMPORTANT INSTRUCTIONS:**
1. The PEP database search above provides authoritative results from official PEP databases (${
        matches.length > 0
          ? matches.map((m) => m.source).join(", ")
          : "various sources"
      }).
2. You MUST ALSO perform comprehensive web searches to:
   - Verify the database results are complete and accurate
   - Find any PEP associations that might not be in the database
   - Check for current or former political positions, government roles, or close associations with PEPs
   - Look for positions in state-owned enterprises
   - Search for family members or business partners who might be PEPs
   - Check for any recent changes in PEP status
3. Document ALL sources you check with specific details:
   - Specific website URLs or publication names
   - Article titles and dates
   - Government records or public databases checked
   - Any false positives found and why they were dismissed
4. Provide the same level of granular detail as previous investigations, including:
   - Specific sources checked (e.g., "Wikipedia", "Government records", "News articles from [publication]")
   - Detailed findings from each source
   - Relevance assessment for each finding
   - False positive analysis with specific examples

Document:
- PEP status (clear/flagged/inconclusive)
- Any PEP findings from the database (with full details including position, country, dates, source)
- Comprehensive web search results with specific sources and findings
- All sources checked, including specific websites, publications, and databases
- Any false positives identified and why they were dismissed
- Confidence level
- Detailed reasoning with source citations`,
      tools: {
        googleSearch: google.tools.googleSearch({}),
      },
    });

    const durationSeconds = (performance.now() - start) / 1000;
    console.log(`✅ Step 3 completed in ${durationSeconds.toFixed(2)}s`);

    return {
      text: result.text,
      durationSeconds,
      matches,
    };
  }
}
