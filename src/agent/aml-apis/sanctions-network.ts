/**
 * Sanctions.network API implementation
 * Free, open-source sanctions screening API
 * Documentation: https://sanctions.network
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

interface SanctionsNetworkResponse {
  matches: Array<{
    name: string;
    list: string;
    score?: number;
    details?: string;
  }>;
  query: string;
}

export class SanctionsNetworkAPI implements AMLAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl = "https://api.sanctions.network", apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  getName(): string {
    return "Sanctions.network";
  }

  isAvailable(): boolean {
    return true; // Always available, no API key required
  }

  async searchSanctions(
    params: SanctionsSearchParams,
  ): Promise<SanctionsMatch[]> {
    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.append("name", params.name);

      if (params.dateOfBirth) {
        url.searchParams.append("dob", params.dateOfBirth);
      }
      if (params.nationality) {
        url.searchParams.append("nationality", params.nationality);
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Sanctions.network API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: SanctionsNetworkResponse = await response.json();

      return this.mapToSanctionsMatches(data, params);
    } catch (error) {
      console.error(`Error querying Sanctions.network: ${error}`);
      // Return empty array on error to allow fallback
      return [];
    }
  }

  private mapToSanctionsMatches(
    data: SanctionsNetworkResponse,
    params: SanctionsSearchParams,
  ): SanctionsMatch[] {
    if (!data.matches || data.matches.length === 0) {
      return [{
        name: params.name,
        list: "Multiple",
        matchType: "none",
        details:
          "No matches found in OFAC SDN, UN Consolidated, or EU FSF lists",
        source: this.getName(),
      }];
    }

    return data.matches.map((match) => ({
      name: match.name,
      list: match.list || "Unknown",
      matchType: this.determineMatchType(match.score),
      details: match.details || `Match found on ${match.list}`,
      source: this.getName(),
    }));
  }

  private determineMatchType(score?: number): "exact" | "fuzzy" | "partial" {
    if (!score) return "fuzzy";
    if (score >= 0.9) return "exact";
    if (score >= 0.7) return "fuzzy";
    return "partial";
  }

  searchPEP(_params: PEPSearchParams): Promise<PEPMatch[]> {
    // Sanctions.network doesn't support PEP screening
    return Promise.resolve([]);
  }

  searchAdverseMedia(
    _params: AdverseMediaSearchParams,
  ): Promise<AdverseMediaMatch[]> {
    // Sanctions.network doesn't support adverse media
    return Promise.resolve([]);
  }
}
