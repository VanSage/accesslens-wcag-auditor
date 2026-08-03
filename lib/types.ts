export interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
}

export interface AxeViolation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor" | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeRunResults {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  url?: string;
  timestamp?: string;
}

export interface AltTextSuggestion {
  selector: string;
  imgSnippet: string;
  srcHint: string;
  suggestedAlt: string;
  source: "heuristic" | "ai";
}

export interface AuditRun {
  id: string;
  ranAt: string;
  score: number;
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  altTextSuggestions: AltTextSuggestion[];
}
