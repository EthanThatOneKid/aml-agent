import type {
  AdverseMediaMatch,
  PEPMatch,
  SanctionsMatch,
} from "../aml-apis/types.ts";

export interface StepResult {
  text: string;
  durationSeconds: number;
}

export interface AdverseMediaResult extends StepResult {
  findings?: AdverseMediaMatch[];
}

export interface PepAgentResult extends StepResult {
  matches: PEPMatch[];
}

export interface SanctionsAgentResult extends StepResult {
  matches: SanctionsMatch[];
}
