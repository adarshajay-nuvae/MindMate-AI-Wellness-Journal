declare global {
  interface Window {
    Recharts?: any;
  }
}

export interface CognitiveDistortion {
  name: string;
  explanation: string;
  example: string; // A quote from the user's text
}

export interface Analysis {
  mood: string;
  summary: string;
  tip: string;
  reflectionPrompt: string;
  cognitiveDistortions?: CognitiveDistortion[];
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  analysis: Analysis;
}

export type View = 'dashboard' | 'editor' | 'insights';