
export interface LegalArticle {
  number: string;
  statuteText: string;
  doctrine?: string;
  jurisprudence?: JurisprudenceEntry[];
}

export interface JurisprudenceEntry {
  court: string;
  centralThesis: string;
  objectiveSummary: string;
}

export interface ProcessingResult {
  lawName: string;
  articles: LegalArticle[];
}

export interface FileData {
  name: string;
  base64: string;
  type: string;
}
