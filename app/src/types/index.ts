// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Item Types
export type ItemType = 'molecule' | 'enzyme' | 'medication';

export interface StudyItem {
  id: string;
  name: string;
  scientificName?: string;
  type: ItemType;
  description: string;
  imageUrl?: string;
  properties: Property[];
  topicId: string;
  chapterId: string;
  createdAt: Date;
  updatedAt: Date;
  flashcardFront?: string;
  flashcardBack?: string;
}

export interface Property {
  key: string;
  value: string;
}

// Topic Types
export interface Topic {
  id: string;
  name: string;
  description: string;
  chapterId: string;
  items: StudyItem[];
  order: number;
}

// Chapter Types
export interface Chapter {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
  order: number;
  color?: string;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  itemId?: string;
}

export interface Quiz {
  id: string;
  name: string;
  chapterId?: string;
  topicId?: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  itemId: string;
  front: string;
  back: string;
  chapterId?: string;
  topicId?: string;
  mastered: boolean;
  lastReviewed?: Date;
}

// Search Types
export interface SearchResult {
  items: StudyItem[];
  topics: Topic[];
  chapters: Chapter[];
}

// PubChem Types
export interface PubChemCompound {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: string;
  iupacName?: string;
  synonyms?: string[];
  description?: string;
}

// App State
export interface AppState {
  user: User | null;
  chapters: Chapter[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  isAuthenticated: boolean;
}
