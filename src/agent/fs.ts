import { toKebabCase } from "@std/text/to-kebab-case";
import { AmlInvestigation } from "./aml-agent.ts";

export async function writeInvestigationFile(
  investigation: AmlInvestigation,
): Promise<string> {
  // Create investigations directory if it doesn't exist
  const investigationsDir = "investigations";
  try {
    await Deno.mkdir(investigationsDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }

  // Generate filename with timestamp and sanitized subject name
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sanitizedSubject = toKebabCase(investigation.subject.name);
  const filename =
    `${investigationsDir}/aml-report-${sanitizedSubject}-${timestamp}.json`;

  // Write the report to file
  const jsonContent = JSON.stringify(investigation, null, 2);
  await Deno.writeTextFile(filename, jsonContent);

  return filename;
}
