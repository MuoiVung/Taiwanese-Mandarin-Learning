
export enum AppStage {
  LEVEL_SELECTION = 'LEVEL_SELECTION',
  TOPIC_GENERATION = 'TOPIC_GENERATION',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  VOCAB_PREP = 'VOCAB_PREP',
  CONVERSATION = 'CONVERSATION',
}

export type TOCFLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

export interface VocabularyItem {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  example: string;          // New: Example sentence
  example_pinyin: string;   // New: Pinyin for example
  example_meaning: string;  // New: Meaning of example
}

export interface Segment {
  text: string;      // The Chinese word/phrase
  pinyin: string;    // Pinyin for this specific word
  meaning: string;   // Vietnamese meaning for this specific word
}

export interface ChatResponse {
  feedback: string;
  feedback_pinyin?: string; // New: Pinyin for the feedback content (correction)
  script: string;
  pinyin: string;
  translation: string;
  segments: Segment[]; // Array of words for interactive clicking
  suggestion?: string;
  suggestion_pinyin?: string; // New: Pinyin for suggestion
  suggestion_meaning?: string; // New: Vietnamese meaning for suggestion
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | ChatResponse;
  timestamp: number;
}

export interface Topic {
  id: number;
  title: string; // Chinese + Pinyin
  vietnamese_title: string; // Vietnamese translation
  description: string; // Context description
}
