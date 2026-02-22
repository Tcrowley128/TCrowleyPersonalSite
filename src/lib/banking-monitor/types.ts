export interface ReleaseItem {
  title: string;
  url: string;
  publishedDate: string | null;
  description: string;
  sourceId: string;
  sourceName: string;
}

export interface AnalyzedRelease extends ReleaseItem {
  relevanceScore: number; // 1–10
  priority: 'high' | 'medium' | 'low' | 'not_relevant';
  summary: string;
  impactAnalysis: string;
  actionRequired: boolean;
  actionDetails: string;
}

export interface MonitorRunResult {
  newItemsFound: number;
  relevantItems: AnalyzedRelease[];
  emailSent: boolean;
  errors: string[];
}
