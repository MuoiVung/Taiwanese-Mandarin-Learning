export enum AppStage {
  LEVEL_SELECTION = 'LEVEL_SELECTION',
  TOPIC_GENERATION = 'TOPIC_GENERATION',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  VOCAB_PREP = 'VOCAB_PREP',
  CONVERSATION = 'CONVERSATION',
}

export type TOCFLLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabularyItem {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

export interface ChatResponse {
  feedback: string;
  script: string;
  pinyin: string;
  translation: string;
  suggestion?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string | ChatResponse;
  timestamp: number;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
}