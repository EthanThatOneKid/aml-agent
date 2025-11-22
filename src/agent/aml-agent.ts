import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const amlReportSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string(),
});

export async function generateAmlReport(query: string) {
  // Get information using Google Search.
  const searchResult = await generateText({
    model: google("gemini-2.5-flash"),
    system:
      "You are a helpful assistant that can help with AML compliance. Use the Web to find everything you can about the individual in question.",
    prompt:
      `Find everything you can about the individual in question: ${query}`,
    tools: {
      googleSearch: google.tools.googleSearch({}),
    },
  });

  // Format the information into structured output.
  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: amlReportSchema,
    prompt:
      `Based on the following information about ${query}, extract and format the data:\n\n${searchResult.text}\n\nFormat the information according to the schema.`,
    system:
      "You are a helpful assistant that formats information into structured data. Extract name, age, and email from the provided information.",
  });

  return result.object;
}
