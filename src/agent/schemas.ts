import { z } from "zod";

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
