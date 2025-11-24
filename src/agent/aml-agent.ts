import type { AmlInvestigation } from "./schemas.ts";
export { amlInvestigationSchema } from "./schemas.ts";
export type { AmlInvestigation } from "./schemas.ts";

import { BasicInfoAgent } from "./sub-agents/basic-info-agent.ts";
import { AdverseMediaAgent } from "./sub-agents/adverse-media-agent.ts";
import { PepAgent } from "./sub-agents/pep-agent.ts";
import { SanctionsAgent } from "./sub-agents/sanctions-agent.ts";
import { SynthesisAgent } from "./sub-agents/synthesis-agent.ts";

const basicInfoAgent = new BasicInfoAgent();
const adverseMediaAgent = new AdverseMediaAgent();
const pepAgent = new PepAgent();
const sanctionsAgent = new SanctionsAgent();
const synthesisAgent = new SynthesisAgent();

export async function generateAmlReport(
  query: string,
  distinguishingDetails: string[] = [],
): Promise<AmlInvestigation> {
  const investigationStartTime = new Date().toISOString();
  const perfStart = performance.now();

  console.log(`\n🔍 Starting AML Investigation for: ${query}`);
  if (distinguishingDetails.length > 0) {
    console.log(
      `🔎 Using ${distinguishingDetails.length} distinguishing detail(s) for disambiguation`,
    );
  }
  console.log(`⏰ Investigation started at: ${investigationStartTime}\n`);

  const detailsContext = distinguishingDetails.length > 0
    ? `\n**Distinguishing Details Provided:**
${distinguishingDetails.map((detail) => `- ${detail}`).join("\n")}

Use these details to help identify the correct individual, especially if the name is common or ambiguous. If URLs are provided, extract information from those sources.`
    : "";

  const basicInfoResult = await basicInfoAgent.run(query, detailsContext);
  const adverseMediaResult = await adverseMediaAgent.run(
    query,
    basicInfoResult.text,
    detailsContext,
  );
  const pepResult = await pepAgent.run(
    query,
    basicInfoResult.text,
    detailsContext,
  );
  const sanctionsResult = await sanctionsAgent.run(
    query,
    basicInfoResult.text,
    detailsContext,
  );

  const investigationEndTime = new Date().toISOString();
  const report = await synthesisAgent.run({
    query,
    detailsContext,
    basicInfoText: basicInfoResult.text,
    adverseMediaText: adverseMediaResult.text,
    pepText: pepResult.text,
    sanctionsText: sanctionsResult.text,
    investigationStartTime,
    investigationEndTime,
  });

  console.log(`\n🎯 Investigation Summary:`);
  console.log(
    `   Risk Level: ${report.riskAssessment.overallRisk.toUpperCase()}`,
  );
  console.log(`   Risk Score: ${report.riskAssessment.riskScore}/100`);
  console.log(`   Decision: ${report.decision.action.toUpperCase()}`);
  console.log(`   Confidence: ${report.decision.confidence}%`);
  console.log(
    `\n⏱️  Total investigation time: ${
      ((performance.now() - perfStart) / 1000).toFixed(2)
    }s`,
  );
  console.log(`✅ Investigation completed at: ${investigationEndTime}\n`);

  return report;
}
