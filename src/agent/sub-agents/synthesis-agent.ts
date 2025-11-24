import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { type AmlInvestigation, amlInvestigationSchema } from "../schemas.ts";
import {
  FEW_SHOT_EXAMPLE,
  INVESTIGATION_INSTRUCTION,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "../prompts.ts";

interface SynthesisInput {
  query: string;
  detailsContext: string;
  basicInfoText: string;
  adverseMediaText: string;
  pepText: string;
  sanctionsText: string;
  investigationStartTime: string;
  investigationEndTime: string;
}

export class SynthesisAgent {
  async run(input: SynthesisInput): Promise<AmlInvestigation> {
    console.log(
      "\n📊 Synthesizing findings and generating structured report...",
    );
    const start = performance.now();

    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: amlInvestigationSchema,
      system: INVESTIGATOR_SYSTEM_PROMPT,
      prompt: `${INVESTIGATION_INSTRUCTION}

${FEW_SHOT_EXAMPLE}

**Complete Investigation for: ${input.query}**${input.detailsContext}

**Basic Information Gathered:**
${input.basicInfoText}

**Adverse Media Check Results:**
${input.adverseMediaText}

**PEP Screening Results:**
${input.pepText}

**Sanctions Review Results:**
${input.sanctionsText}

**Instructions:**
1. Extract and structure all the information above into the schema
2. Perform data correlation: cross-reference findings across all sources
3. Assess overall risk level (low/medium/high) with a numerical score (0-100)
4. Identify specific risk factors and mitigating factors
5. Make a decision: approve (low risk), flag (medium risk), or escalate (high risk)
6. Provide chain-of-thought reasoning for your decision
7. Analyze potential false positives
8. Generate complete audit trail with timestamps

**Investigation Timeline:**
- Start: ${input.investigationStartTime}
- End: ${input.investigationEndTime}

**Critical Requirements for Evidence Section:**
- Include EVERY source checked with specific details:
  - For API results: Include the API provider name (e.g., "Sanctions.network", "OFAC-API.com") and which lists were checked
  - For web searches: Include specific websites, publications, article titles, and dates
  - For each evidence item, provide:
    - Specific source name/URL
    - Type (database, web, news, public_record, social_media)
    - Timestamp (use the investigation timeline)
    - Detailed findings (what was found, not just "no matches")
    - Relevance level (high/medium/low)
- Document false positives explicitly: If similar names or entities were found but dismissed, include them in evidence with explanation
- Include granular details: Specific list names (e.g., "OFAC SDN List", "UN Security Council Consolidated List"), publication names, article titles, dates
- Match the level of detail from previous investigations - be comprehensive and specific

**Critical Requirements:**
- Every finding must cite its source with specific details
- All reasoning must be transparent and evidence-based
- Explicitly analyze false positive risk with examples
- Provide confidence levels for each check
- Document all investigation steps in the audit trail with specific data sources
- Include API sources in evidence (e.g., "Sanctions.network - OFAC SDN List", "OFAC-API.com - PEP Database")
- Include web search sources in evidence (e.g., "Google Search - [specific query]", "Wikipedia", "[Publication Name]")
- Follow the example structure above for consistency`,
    });

    const durationSeconds = (performance.now() - start) / 1000;
    console.log(
      `✅ Report synthesis completed in ${durationSeconds.toFixed(2)}s`,
    );

    return result.object;
  }
}
