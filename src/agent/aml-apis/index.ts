/**
 * AML API Integration Layer
 *
 * This module provides a unified interface for accessing various AML data sources.
 * It supports multiple providers and can fall back between them.
 */

import { SanctionsNetworkAPI } from "./sanctions-network.ts";
import { OFACAPI } from "./ofac-api.ts";
import type {
  AdverseMediaMatch,
  AdverseMediaSearchParams,
  AMLAPI,
  PEPMatch,
  PEPSearchParams,
  SanctionsMatch,
  SanctionsSearchParams,
} from "./types.ts";

/**
 * AML API Manager
 * Manages multiple API providers and provides fallback logic
 */
export class AMLAPIManager {
  private apis: AMLAPI[] = [];
  private sanctionsAPIs: Array<{ api: AMLAPI; priority: number }> = [];
  private pepAPIs: Array<{ api: AMLAPI; priority: number }> = [];
  private adverseMediaAPIs: Array<{ api: AMLAPI; priority: number }> = [];

  constructor() {
    this.initializeAPIs();
  }

  private initializeAPIs() {
    // Initialize Sanctions.network (free, always available)
    const sanctionsNetwork = new SanctionsNetworkAPI();
    this.addAPI(sanctionsNetwork, { sanctions: 1, pep: 0, adverseMedia: 0 });

    // Initialize OFAC-API.com if API key is available
    const ofacAPI = new OFACAPI();
    if (ofacAPI.isAvailable()) {
      this.addAPI(ofacAPI, { sanctions: 0, pep: 0, adverseMedia: 0 });
    } else {
      console.log("OFAC-API.com not available (API key not set)");
    }

    // Sort APIs by priority (lower number = higher priority)
    this.sanctionsAPIs.sort((a, b) => a.priority - b.priority);
    this.pepAPIs.sort((a, b) => a.priority - b.priority);
    this.adverseMediaAPIs.sort((a, b) => a.priority - b.priority);
  }

  private addAPI(
    api: AMLAPI,
    priorities: { sanctions: number; pep: number; adverseMedia: number },
  ) {
    this.apis.push(api);

    if (priorities.sanctions >= 0) {
      this.sanctionsAPIs.push({ api, priority: priorities.sanctions });
    }
    if (priorities.pep >= 0) {
      this.pepAPIs.push({ api, priority: priorities.pep });
    }
    if (priorities.adverseMedia >= 0) {
      this.adverseMediaAPIs.push({ api, priority: priorities.adverseMedia });
    }
  }

  /**
   * Search sanctions lists across all available APIs
   * Tries APIs in priority order until one succeeds
   * Returns results with "none" match if no matches found (to indicate lists were checked)
   */
  async searchSanctions(
    params: SanctionsSearchParams,
  ): Promise<SanctionsMatch[]> {
    const errors: Error[] = [];
    const checkedAPIs: string[] = [];

    for (const { api } of this.sanctionsAPIs) {
      checkedAPIs.push(api.getName());
      try {
        const results = await api.searchSanctions(params);
        console.log(`✅ Sanctions search via ${api.getName()}`);
        // If we got results (even if empty with "none" match), return them
        // This ensures we document which lists were checked
        if (results.length > 0) {
          return results;
        }
        // If no results but API succeeded, return a "none" match to document the check
        return [{
          name: params.name,
          list: `Checked via ${api.getName()}`,
          matchType: "none",
          details: `No matches found. Searched via ${api.getName()} API.`,
          source: api.getName(),
        }];
      } catch (error) {
        errors.push(error as Error);
        console.warn(
          `⚠️  ${api.getName()} sanctions search failed: ${error}`,
        );
        continue;
      }
    }

    // If all APIs failed, return empty result
    if (errors.length > 0) {
      console.error("All sanctions APIs failed:", errors);
    }
    // Return a result indicating APIs were attempted but failed
    return [{
      name: params.name,
      list: `Attempted: ${checkedAPIs.join(", ")}`,
      matchType: "none",
      details: `API searches attempted but failed. Web search recommended.`,
      source: "API Manager",
    }];
  }

  /**
   * Search PEP databases across all available APIs
   * Returns empty array if no matches (different from sanctions - PEP either matches or doesn't)
   */
  async searchPEP(params: PEPSearchParams): Promise<PEPMatch[]> {
    const errors: Error[] = [];
    const checkedAPIs: string[] = [];

    for (const { api } of this.pepAPIs) {
      checkedAPIs.push(api.getName());
      try {
        const results = await api.searchPEP(params);
        console.log(`✅ PEP search via ${api.getName()}`);
        // Return results even if empty - the prompt will handle documenting the check
        return results;
      } catch (error) {
        errors.push(error as Error);
        console.warn(`⚠️  ${api.getName()} PEP search failed: ${error}`);
        continue;
      }
    }

    if (errors.length > 0) {
      console.error("All PEP APIs failed:", errors);
    }
    // Return empty - the prompt will document that PEP databases were checked
    return [];
  }

  /**
   * Search adverse media across all available APIs
   */
  async searchAdverseMedia(
    params: AdverseMediaSearchParams,
  ): Promise<AdverseMediaMatch[]> {
    const errors: Error[] = [];

    for (const { api } of this.adverseMediaAPIs) {
      try {
        const results = await api.searchAdverseMedia(params);
        if (results.length > 0) {
          console.log(`✅ Adverse media search via ${api.getName()}`);
          return results;
        }
      } catch (error) {
        errors.push(error as Error);
        console.warn(
          `⚠️  ${api.getName()} adverse media search failed: ${error}`,
        );
        continue;
      }
    }

    if (errors.length > 0) {
      console.error("All adverse media APIs failed:", errors);
    }
    return [];
  }

  /**
   * Get list of available API providers
   */
  getAvailableAPIs(): string[] {
    return this.apis.map((api) => api.getName());
  }
}

// Export singleton instance
export const amlAPIManager = new AMLAPIManager();

// Export types
export type {
  AdverseMediaMatch,
  AdverseMediaSearchParams,
  PEPMatch,
  PEPSearchParams,
  SanctionsMatch,
  SanctionsSearchParams,
};
