export interface SanctionsMatch {
  name: string;
  aliases?: string[];
  dateOfBirth?: string;
  nationality?: string;
  list: string; // e.g., "OFAC SDN", "UN Consolidated", "EU FSF"
  matchType: "exact" | "fuzzy" | "partial" | "none";
  details: string;
  source: string;
}

export interface PEPMatch {
  name: string;
  position: string;
  country: string;
  dates?: string;
  source: string;
}

export interface AdverseMediaMatch {
  source: string;
  title: string;
  date?: string;
  relevance: "high" | "medium" | "low";
  summary: string;
  url?: string;
}

export interface SanctionsSearchParams {
  name: string;
  dateOfBirth?: string;
  nationality?: string;
  location?: string;
}

export interface PEPSearchParams {
  name: string;
  dateOfBirth?: string;
  nationality?: string;
  location?: string;
}

export interface AdverseMediaSearchParams {
  name: string;
  dateOfBirth?: string;
  nationality?: string;
  location?: string;
  company?: string;
}

/**
 * Interface for sanctions screening APIs
 */
export interface SanctionsAPI {
  searchSanctions(params: SanctionsSearchParams): Promise<SanctionsMatch[]>;
  getName(): string;
}

/**
 * Interface for PEP screening APIs
 */
export interface PEPAPI {
  searchPEP(params: PEPSearchParams): Promise<PEPMatch[]>;
  getName(): string;
}

/**
 * Interface for adverse media APIs
 */
export interface AdverseMediaAPI {
  searchAdverseMedia(
    params: AdverseMediaSearchParams,
  ): Promise<AdverseMediaMatch[]>;
  getName(): string;
}

/**
 * Combined AML API interface
 */
export interface AMLAPI extends SanctionsAPI, PEPAPI, AdverseMediaAPI {
  getName(): string;
  isAvailable(): boolean;
}
