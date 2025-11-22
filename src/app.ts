import { generateAmlReport } from "./agent/aml-agent.ts";
import { writeInvestigationFile } from "./agent/fs.ts";

function promptDetails(): string[] {
  const details: string[] = [];
  console.log(
    "\n💡 Enter distinguishing details or URLs to help identify the individual",
  );
  console.log("   (e.g., date of birth, location, LinkedIn URL, company name)");
  console.log("   Press Enter with an empty input to finish adding details.\n");

  while (true) {
    const detail = prompt(
      `Detail ${details.length + 1} (or press Enter to finish): `,
    );
    if (!detail || detail.trim() === "") {
      break;
    }

    details.push(detail.trim());
  }

  return details;
}

if (import.meta.main) {
  const subject = prompt("Enter the subject of the AML report:");
  if (!subject) {
    console.error("No subject provided");
    Deno.exit(1);
  }

  const distinguishingDetails = promptDetails();
  if (distinguishingDetails.length > 0) {
    console.log(
      `\n✅ Collected ${distinguishingDetails.length} distinguishing detail(s)`,
    );
  }

  const startTime = performance.now();
  const investigation = await generateAmlReport(subject, distinguishingDetails);
  const endTime = performance.now();
  const duration = endTime - startTime;

  try {
    const filename = await writeInvestigationFile(investigation);
    console.log(`\n💾 Report saved to: ${filename}`);
  } catch (error) {
    console.error("❌ Error saving report:", error);
  }

  console.log("\n📄 Generation Result:", investigation);
  console.log(
    `⏱️  Generation took ${duration.toFixed(2)}ms (${
      (duration / 1000).toFixed(2)
    }s)`,
  );
}
