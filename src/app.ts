import { generateAmlReport } from "./agent/aml-agent.ts";

if (import.meta.main) {
  const startTime = performance.now();
  const result = await generateAmlReport("Ethan Davidson");
  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log("Generation Result:", result);
  console.log(
    `Generation took ${duration.toFixed(2)}ms (${
      (duration / 1000).toFixed(2)
    }s)`,
  );
}
