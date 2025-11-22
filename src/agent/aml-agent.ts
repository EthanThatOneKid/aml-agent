import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Schema Definitions

// Subject Information Schema
const subjectSchema = z.object({
  name: z.string().describe("Full name of the individual being investigated"),
  dateOfBirth: z.string().optional().describe("Date of birth if found"),
  nationality: z.string().optional().describe("Nationality if found"),
  location: z.string().optional().describe("Current or last known location"),
});

// Adverse Media Schemas
const adverseMediaFindingSchema = z.object({
  source: z.string().describe(
    "Source of the finding (news article, social media, etc.)",
  ),
  title: z.string().describe("Title or description of the finding"),
  date: z.string().optional().describe("Date of the finding if available"),
  relevance: z.enum(["high", "medium", "low"]).describe(
    "Relevance of the finding",
  ),
  summary: z.string().describe("Summary of the adverse media finding"),
});

const adverseMediaCheckSchema = z.object({
  status: z.enum(["clear", "flagged", "inconclusive"]).describe(
    "Result of adverse media check",
  ),
  findings: z.array(adverseMediaFindingSchema).describe(
    "List of adverse media findings",
  ),
  confidence: z.number().min(0).max(100).describe(
    "Confidence level (0-100) for this check",
  ),
  reasoning: z.string().describe(
    "Explanation of the adverse media check results",
  ),
});

// PEP Screening Schemas
const pepFindingSchema = z.object({
  position: z.string().describe("Political position or role"),
  country: z.string().describe("Country where position was held"),
  dates: z.string().optional().describe("Dates of service if available"),
  source: z.string().describe("Source of PEP information"),
});

const pepScreeningSchema = z.object({
  status: z.enum(["clear", "pep_identified", "inconclusive"]).describe(
    "Result of PEP screening",
  ),
  findings: z.array(pepFindingSchema).describe("PEP findings if any"),
  confidence: z.number().min(0).max(100).describe(
    "Confidence level (0-100) for this check",
  ),
  reasoning: z.string().describe("Explanation of the PEP screening results"),
});

// Sanctions Review Schemas
const sanctionsIdentifiersSchema = z.object({
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
});

const sanctionsFindingSchema = z.object({
  list: z.string().describe("Sanctions list checked (OFAC, UN, EU, etc.)"),
  matchType: z.enum(["exact", "fuzzy", "none"]).describe(
    "Type of match found",
  ),
  details: z.string().describe(
    "Details of the match or why it was cleared",
  ),
  identifiers: sanctionsIdentifiersSchema.optional().describe(
    "Identifiers used for matching",
  ),
});

const sanctionsReviewSchema = z.object({
  status: z.enum(["clear", "sanctioned", "potential_match", "inconclusive"])
    .describe("Result of sanctions review"),
  findings: z.array(sanctionsFindingSchema).describe(
    "Sanctions check results",
  ),
  confidence: z.number().min(0).max(100).describe(
    "Confidence level (0-100) for this check",
  ),
  reasoning: z.string().describe(
    "Explanation of the sanctions review results",
  ),
});

// Risk Assessment Schema
const riskAssessmentSchema = z.object({
  overallRisk: z.enum(["low", "medium", "high"]).describe(
    "Overall risk level",
  ),
  riskScore: z.number().min(0).max(100).describe(
    "Numerical risk score (0-100)",
  ),
  riskFactors: z.array(z.string()).describe(
    "List of identified risk factors",
  ),
  mitigatingFactors: z.array(z.string()).describe(
    "List of mitigating factors that reduce risk",
  ),
  reasoning: z.string().describe("Detailed explanation of risk assessment"),
});

// Decision Schema
const decisionSchema = z.object({
  action: z.enum(["approve", "flag", "escalate"]).describe(
    "Recommended action",
  ),
  reasoning: z.string().describe(
    "Chain-of-thought reasoning for the decision",
  ),
  confidence: z.number().min(0).max(100).describe(
    "Confidence level in the decision",
  ),
  falsePositiveAnalysis: z.string().describe(
    "Analysis of whether this might be a false positive",
  ),
});

// Evidence Schema
const evidenceItemSchema = z.object({
  source: z.string().describe("Data source checked"),
  type: z.enum(["database", "news", "social_media", "public_record", "web"])
    .describe("Type of source"),
  timestamp: z.string().describe("When this source was checked"),
  findings: z.string().describe("What was found in this source"),
  relevance: z.enum(["high", "medium", "low"]).describe(
    "Relevance to the investigation",
  ),
});

// Audit Trail Schemas
const auditTrailStepSchema = z.object({
  step: z.string().describe("Investigation step performed"),
  timestamp: z.string().describe("When the step was performed"),
  dataSources: z.array(z.string()).describe(
    "Data sources checked in this step",
  ),
  findings: z.string().describe("Summary of findings from this step"),
});

const auditTrailSchema = z.object({
  investigationStartTime: z.string().describe(
    "When the investigation started",
  ),
  investigationEndTime: z.string().describe(
    "When the investigation completed",
  ),
  steps: z.array(auditTrailStepSchema).describe(
    "Complete audit trail of investigation steps",
  ),
});

// Comprehensive AML Investigation Schema
export const amlInvestigationSchema = z.object({
  subject: subjectSchema,
  adverseMediaCheck: adverseMediaCheckSchema,
  pepScreening: pepScreeningSchema,
  sanctionsReview: sanctionsReviewSchema,
  riskAssessment: riskAssessmentSchema,
  decision: decisionSchema,
  evidence: z.array(evidenceItemSchema).describe("Complete evidence trail"),
  auditTrail: auditTrailSchema,
});

export type AmlInvestigation = z.infer<typeof amlInvestigationSchema>;

// System Prompts
const INVESTIGATOR_SYSTEM_PROMPT =
  `You are an AI compliance investigator for an AML compliance automation platform. You act as a legal team with three roles:

1. **Prosecution**: Gather evidence that might indicate risk or non-compliance
2. **Defense**: Consider alternative explanations and verify findings to avoid false positives
3. **Judge**: Make evidence-based decisions based on all available information

Your investigations must be:
- **100% Transparent**: Every decision must be explainable with evidence
- **Evidence-Based**: All findings must cite specific sources
- **Thorough**: Check multiple data sources and cross-reference findings
- **Regulatory Compliant**: Follow AML/KYC best practices and document everything

You must provide step-by-step reasoning (chain-of-thought) for all decisions and explicitly analyze potential false positives.`;

const INVESTIGATION_INSTRUCTION =
  `Perform a comprehensive AML compliance investigation following this structured approach:

**Step 1: Gather Basic Information**
- Search for the individual's basic information (name, DOB, nationality, location)
- Verify identity across multiple sources

**Step 2: Adverse Media Check**
- Search news articles, blogs, social media, and web sources
- Look for negative information about financial crimes, fraud, corruption, or other high-risk activities
- Assess relevance and credibility of each finding
- Document all sources with dates and summaries

**Step 3: PEP Screening**
- Check if the individual is a Politically Exposed Person (PEP)
- Look for current or former political positions, government roles, or close associations with PEPs
- Document positions, countries, and dates

**Step 4: Sanctions Review**
- Check against major sanctions lists (OFAC, UN, EU sanctions)
- Perform name matching with identifiers (DOB, nationality) to reduce false positives
- Document which lists were checked and match results

**Step 5: Data Correlation**
- Cross-reference findings across all sources
- Identify patterns or connections that might indicate risk
- Verify consistency of information

**Step 6: Risk Assessment**
- Synthesize all findings into an overall risk level
- Identify specific risk factors
- Consider mitigating factors
- Provide numerical risk score (0-100)

**Step 7: Decision Making**
- Make a clear decision: approve, flag, or escalate
- Provide chain-of-thought reasoning
- Explicitly analyze potential false positives
- State confidence level in the decision

**Output Requirements:**
- Every finding must cite its source
- All timestamps must be included
- Complete audit trail of all steps
- Transparent reasoning for every conclusion`;

// Few-shot example for structured output
const FEW_SHOT_EXAMPLE = `
Example Investigation Output Structure:

Subject: {
  name: "John Smith",
  dateOfBirth: "1980-05-15",
  nationality: "US",
  location: "New York, USA"
}

Adverse Media Check: {
  status: "clear",
  findings: [
    {
      source: "New York Times article",
      title: "Local Business Owner Wins Award",
      date: "2023-06-10",
      relevance: "low",
      summary: "Positive news article about business achievement"
    }
  ],
  confidence: 95,
  reasoning: "Searched news, social media, and web sources. Found only positive or neutral information. No adverse media detected."
}

PEP Screening: {
  status: "clear",
  findings: [],
  confidence: 90,
  reasoning: "No evidence of current or former political positions, government roles, or close associations with PEPs found in public records."
}

Sanctions Review: {
  status: "clear",
  findings: [
    {
      list: "OFAC",
      matchType: "none",
      details: "No matches found. Name 'John Smith' is common, but DOB and nationality do not match any sanctioned individuals.",
      identifiers: {
        name: "John Smith",
        dateOfBirth: "1980-05-15",
        nationality: "US"
      }
    }
  ],
  confidence: 85,
  reasoning: "Checked OFAC, UN, and EU sanctions lists. No matches found when considering name, DOB, and nationality together."
}

Risk Assessment: {
  overallRisk: "low",
  riskScore: 15,
  riskFactors: [],
  mitigatingFactors: [
    "No adverse media found",
    "Not a PEP",
    "No sanctions matches",
    "Consistent identity information across sources"
  ],
  reasoning: "All compliance checks returned clear results. No risk factors identified. Subject appears to be low-risk."
}

Decision: {
  action: "approve",
  reasoning: "Step 1: All identity information is consistent. Step 2: No adverse media found. Step 3: Not a PEP. Step 4: No sanctions matches. Step 5: All findings correlate positively. Step 6: Risk score is low (15/100). Step 7: Decision is to approve with high confidence.",
  confidence: 90,
  falsePositiveAnalysis: "Low risk of false positive. Name is common but identifiers (DOB, nationality) were used to verify. All checks returned clear results consistently."
}
`;

export async function generateAmlReport(
  query: string,
  distinguishingDetails: string[] = [],
): Promise<AmlInvestigation> {
  const investigationStartTime = new Date().toISOString();
  console.log(`\n🔍 Starting AML Investigation for: ${query}`);
  if (distinguishingDetails.length > 0) {
    console.log(
      `🔎 Using ${distinguishingDetails.length} distinguishing detail(s) for disambiguation`,
    );
  }
  console.log(`⏰ Investigation started at: ${investigationStartTime}\n`);

  // Build distinguishing details context
  const detailsContext = distinguishingDetails.length > 0
    ? `\n**Distinguishing Details Provided:**
${distinguishingDetails.map((detail) => `- ${detail}`).join("\n")}

Use these details to help identify the correct individual, especially if the name is common or ambiguous. If URLs are provided, extract information from those sources.`
    : "";

  // Step 1: Gather basic information and perform initial search
  console.log("📋 Step 1/4: Gathering basic information...");
  const step1StartTime = performance.now();
  const basicInfoResult = await generateText({
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
  const step1Duration = ((performance.now() - step1StartTime) / 1000).toFixed(
    2,
  );
  console.log(`✅ Step 1 completed in ${step1Duration}s`);

  // Step 2: Adverse Media Check
  console.log("📰 Step 2/4: Checking adverse media...");
  const step2StartTime = performance.now();
  const adverseMediaResult = await generateText({
    model: google("gemini-2.5-flash"),
    system: INVESTIGATOR_SYSTEM_PROMPT,
    prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 2 - Adverse Media Check**

Based on the following information about ${query}:
${basicInfoResult.text}${detailsContext}

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
  const step2Duration = ((performance.now() - step2StartTime) / 1000).toFixed(
    2,
  );
  console.log(`✅ Step 2 completed in ${step2Duration}s`);

  // Step 3: PEP Screening
  console.log("🏛️  Step 3/4: Screening for PEP status...");
  const step3StartTime = performance.now();
  const pepResult = await generateText({
    model: google("gemini-2.5-flash"),
    system: INVESTIGATOR_SYSTEM_PROMPT,
    prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 3 - PEP Screening**

Based on the following information about ${query}:
${basicInfoResult.text}${detailsContext}

Search for evidence that this individual is a Politically Exposed Person (PEP). Use the distinguishing details to verify you're checking the correct person:
- Current or former political positions
- Government roles or appointments
- Close associations with PEPs (family members, business partners)
- Positions in state-owned enterprises

Document any PEP findings with:
- Position or role
- Country
- Dates of service (if available)
- Source of information`,
    tools: {
      googleSearch: google.tools.googleSearch({}),
    },
  });
  const step3Duration = ((performance.now() - step3StartTime) / 1000).toFixed(
    2,
  );
  console.log(`✅ Step 3 completed in ${step3Duration}s`);

  // Step 4: Sanctions Review
  console.log("🚫 Step 4/4: Reviewing sanctions lists...");
  const step4StartTime = performance.now();
  const sanctionsResult = await generateText({
    model: google("gemini-2.5-flash"),
    system: INVESTIGATOR_SYSTEM_PROMPT,
    prompt: `${INVESTIGATION_INSTRUCTION}

**Current Task: Step 4 - Sanctions Review**

Based on the following information about ${query}:
${basicInfoResult.text}${detailsContext}

Check if this individual appears on sanctions lists. Use the distinguishing details (especially DOB, nationality, location) to reduce false positives from common names. Note: You cannot directly access sanctions databases, but you can:
- Search for public information about sanctions listings
- Check if the individual has been publicly reported as sanctioned
- Look for news articles or government announcements about sanctions

Document:
- Which sanctions lists were conceptually checked (OFAC, UN, EU, etc.)
- Any matches or potential matches found
- Identifiers used (name, DOB, nationality)
- Why matches were confirmed or cleared

Important: Use identifiers (DOB, nationality) to reduce false positives from common names.`,
    tools: {
      googleSearch: google.tools.googleSearch({}),
    },
  });
  const step4Duration = ((performance.now() - step4StartTime) / 1000).toFixed(
    2,
  );
  console.log(`✅ Step 4 completed in ${step4Duration}s`);

  // Step 5-7: Synthesize all findings into structured report
  console.log("\n📊 Synthesizing findings and generating structured report...");
  const synthesisStartTime = performance.now();
  const investigationEndTime = new Date().toISOString();

  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: amlInvestigationSchema,
    system: INVESTIGATOR_SYSTEM_PROMPT,
    prompt: `${INVESTIGATION_INSTRUCTION}

${FEW_SHOT_EXAMPLE}

**Complete Investigation for: ${query}**${detailsContext}

**Basic Information Gathered:**
${basicInfoResult.text}

**Adverse Media Check Results:**
${adverseMediaResult.text}

**PEP Screening Results:**
${pepResult.text}

**Sanctions Review Results:**
${sanctionsResult.text}

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
- Start: ${investigationStartTime}
- End: ${investigationEndTime}

**Critical Requirements:**
- Every finding must cite its source
- All reasoning must be transparent and evidence-based
- Explicitly analyze false positive risk
- Provide confidence levels for each check
- Document all investigation steps in the audit trail
- Follow the example structure above for consistency`,
  });

  const synthesisDuration = ((performance.now() - synthesisStartTime) / 1000)
    .toFixed(2);
  const totalDuration = ((performance.now() - step1StartTime) / 1000).toFixed(
    2,
  );

  console.log(`✅ Report synthesis completed in ${synthesisDuration}s`);
  console.log(`\n🎯 Investigation Summary:`);
  console.log(
    `   Risk Level: ${result.object.riskAssessment.overallRisk.toUpperCase()}`,
  );
  console.log(`   Risk Score: ${result.object.riskAssessment.riskScore}/100`);
  console.log(`   Decision: ${result.object.decision.action.toUpperCase()}`);
  console.log(`   Confidence: ${result.object.decision.confidence}%`);
  console.log(`\n⏱️  Total investigation time: ${totalDuration}s`);
  console.log(`✅ Investigation completed at: ${investigationEndTime}\n`);

  return result.object;
}
