/**
 * OFAC-API.com implementation
 * Comprehensive sanctions and PEP screening API
 * Documentation: https://docs.ofac-api.com
 *
 * Note: Requires API key. Set OFAC_API_KEY environment variable.
 */

import type {
  AdverseMediaMatch,
  AdverseMediaSearchParams,
  AMLAPI,
  PEPMatch,
  PEPSearchParams,
  SanctionsMatch,
  SanctionsSearchParams,
} from "./types.ts";

interface OFACAPISanctionsResponse {
  matches: Array<{
    name: string;
    aliases?: string[];
    dateOfBirth?: string;
    nationality?: string;
    list: string;
    matchScore: number;
    details: string;
  }>;
}

interface OFACAPIPEPResponse {
  matches: Array<{
    name: string;
    position: string;
    country: string;
    dates?: string;
  }>;
}

export class OFACAPI implements AMLAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = "https://api.ofac-api.com/v3";
    this.apiKey = apiKey || Deno.env.get("OFAC_API_KEY") || "";

    if (!this.apiKey) {
      console.warn(
        "OFAC_API_KEY not set. OFAC-API.com will not be available.",
      );
    }
  }

  getName(): string {
    return "OFAC-API.com";
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async searchSanctions(
    params: SanctionsSearchParams,
  ): Promise<SanctionsMatch[]> {
    if (!this.isAvailable()) {
      throw new Error("OFAC-API.com API key not configured");
    }

    try {
      const url = new URL(`${this.baseUrl}/search`);

      const requestBody = {
        name: params.name,
        ...(params.dateOfBirth && { dateOfBirth: params.dateOfBirth }),
        ...(params.nationality && { nationality: params.nationality }),
      };

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `OFAC-API.com error: ${response.status} ${response.statusText}`,
        );
      }

      const data: OFACAPISanctionsResponse = await response.json();

      if (!data.matches || data.matches.length === 0) {
        return [{
          name: params.name,
          list: "Multiple",
          matchType: "none",
          details: "No matches found across all sanctions lists",
          source: this.getName(),
        }];
      }

      return data.matches.map((match) => ({
        name: match.name,
        aliases: match.aliases,
        dateOfBirth: match.dateOfBirth,
        nationality: match.nationality,
        list: match.list,
        matchType: this.determineMatchType(match.matchScore),
        details: match.details,
        source: this.getName(),
      }));
    } catch (error) {
      console.error(`Error querying OFAC-API.com: ${error}`);
      throw error;
    }
  }

  async searchPEP(params: PEPSearchParams): Promise<PEPMatch[]> {
    if (!this.isAvailable()) {
      throw new Error("OFAC-API.com API key not configured");
    }

    try {
      const url = new URL(`${this.baseUrl}/pep/search`);

      const requestBody = {
        name: params.name,
        ...(params.dateOfBirth && { dateOfBirth: params.dateOfBirth }),
        ...(params.nationality && { nationality: params.nationality }),
      };

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `OFAC-API.com PEP error: ${response.status} ${response.statusText}`,
        );
      }

      const data: OFACAPIPEPResponse = await response.json();

      return (data.matches || []).map((match) => ({
        name: match.name,
        position: match.position,
        country: match.country,
        dates: match.dates,
        source: this.getName(),
      }));
    } catch (error) {
      console.error(`Error querying OFAC-API.com PEP: ${error}`);
      return [];
    }
  }

  searchAdverseMedia(
    _params: AdverseMediaSearchParams,
  ): Promise<AdverseMediaMatch[]> {
    // OFAC-API.com may not have adverse media, return empty
    // This can be implemented if they add this feature
    return Promise.resolve([]);
  }

  private determineMatchType(score: number): "exact" | "fuzzy" | "partial" {
    if (score >= 0.95) return "exact";
    if (score >= 0.8) return "fuzzy";
    return "partial";
  }
}
