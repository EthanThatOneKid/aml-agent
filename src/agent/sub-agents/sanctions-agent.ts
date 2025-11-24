import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { amlAPIManager } from "../aml-apis/index.ts";
import {
  INVESTIGATION_INSTRUCTION,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "../prompts.ts";
import type { SanctionsAgentResult } from "./types.ts";

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

export class SanctionsAgent {
  constructor(
    private readonly apiManager: typeof amlAPIManager = amlAPIManager,
  ) {}

  async run(
    query: string,
    basicInfoText: string,
    detailsContext: string,
  ): Promise<SanctionsAgentResult> {
    console.log("🚫 Step 4/4: Reviewing sanctions lists...");
    const start = performance.now();

    const identifiers = extractIdentifiers(basicInfoText);
    const matches = await this.apiManager.searchSanctions({
      name: query,
      ...identifiers,
    });

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: INVESTIGATOR_SYSTEM_PROMPT,
      prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 4 - Sanctions Review**

Based on the following information about ${query}:
${basicInfoText}${detailsContext}

**Sanctions Database Search Results:**
${
        matches.length > 0
          ? matches.map((m) => {
            if (m.matchType === "none") {
              return `- No matches found on ${m.list}\n  Details: ${m.details}\n  Source: ${m.source}${
                m.aliases && m.aliases.length > 0
                  ? `\n  Aliases checked: ${m.aliases.join(", ")}`
                  : ""
              }`;
            }
            return `- Match Found:\n  Name: ${m.name}\n  List: ${m.list}\n  Match Type: ${m.matchType}\n  Details: ${m.details}${
              m.dateOfBirth ? `\n  DOB: ${m.dateOfBirth}` : ""
            }${m.nationality ? `\n  Nationality: ${m.nationality}` : ""}${
              m.aliases && m.aliases.length > 0
                ? `\n  Aliases: ${m.aliases.join(", ")}`
                : ""
            }\n  Source: ${m.source}`;
          }).join("\n\n")
          : "No sanctions matches found in database searches."
      }

**IMPORTANT INSTRUCTIONS:**
1. The sanctions database search above provides authoritative results from official sanctions lists (${
        matches.length > 0
          ? matches.map((m) => m.source).filter((v, i, a) => a.indexOf(v) === i)
            .join(", ")
          : "various sources"
      }).
2. You MUST ALSO perform comprehensive web searches to:
   - Verify the database results are complete
   - Check for any recent sanctions announcements or updates
   - Look for news articles or government announcements about sanctions
   - Verify if the individual has been publicly reported as sanctioned
   - Check for any aliases or name variations that might appear in sanctions lists
3. Document ALL sources you check with specific details:
   - Specific sanctions lists checked (OFAC SDN, UN Consolidated, EU FSF, etc.)
   - Specific website URLs or publication names
   - Article titles and dates
   - Government records or public databases checked
   - Any false positives found and why they were dismissed
4. Provide the same level of granular detail as previous investigations, including:
   - Specific sources checked (e.g., "OFAC SDN List", "UN Security Council Consolidated List", "EU Financial Sanctions File", "News articles from [publication]")
   - Detailed findings from each source
   - Relevance assessment for each finding
   - False positive analysis with specific examples
   - Match type analysis (exact, fuzzy, partial, none)

Document:
- Which sanctions lists were checked (from the API results AND web searches)
- Match status (clear/flagged/inconclusive)
- Any matches found and their details (including match type, aliases, identifiers)
- Identifiers used (name, DOB, nationality, location)
- Why matches were confirmed or cleared (with detailed analysis)
- Confidence level based on the quality of identifiers available
- Detailed reasoning with source citations

Important: If DOB and nationality are missing, note this as a limitation in the confidence assessment. Document which specific lists were checked and the methodology used.`,
      tools: {
        googleSearch: google.tools.googleSearch({}),
      },
    });

    const durationSeconds = (performance.now() - start) / 1000;
    console.log(`✅ Step 4 completed in ${durationSeconds.toFixed(2)}s`);

    return {
      text: result.text,
      durationSeconds,
      matches,
    };
  }
}
