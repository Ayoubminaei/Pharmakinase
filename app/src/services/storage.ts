import type { Chapter, Flashcard, Quiz, User } from '@/types';

const STORAGE_KEYS = {
  USER: 'pharmastudy_user',
  CHAPTERS: 'pharmastudy_chapters',
  FLASHCARDS: 'pharmastudy_flashcards',
  QUIZZES: 'pharmastudy_quizzes',
  AUTH: 'pharmastudy_auth',
};

// User Storage
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Auth Storage
export const setAuthenticated = (isAuth: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuth));
};

export const isAuthenticated = (): boolean => {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH);
  return data ? JSON.parse(data) : false;
};

// Chapters Storage
export const saveChapters = (chapters: Chapter[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
};

export const getChapters = (): Chapter[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
  return data ? JSON.parse(data) : [];
};

// Flashcards Storage
export const saveFlashcards = (flashcards: Flashcard[]): void => {
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
};

export const getFlashcards = (): Flashcard[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
  return data ? JSON.parse(data) : [];
};

// Quizzes Storage
export const saveQuizzes = (quizzes: Quiz[]): void => {
  localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
};

export const getQuizzes = (): Quiz[] => {
  const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
  return data ? JSON.parse(data) : [];
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Initialize sample data
export const initializeSampleData = (): void => {
  const existingChapters = getChapters();
  if (existingChapters.length === 0) {
    const sampleChapters: Chapter[] = [
      {
        id: 'ch-1',
        name: 'Introduction to Pharmacology',
        description: 'Definitions, routes of administration, and the basics of drug action.',
        order: 1,
        topics: [
          {
            id: 'tp-1-1',
            name: 'Definition and Scope',
            description: 'What is pharmacology and its branches.',
            chapterId: 'ch-1',
            order: 1,
            items: []
          },
          {
            id: 'tp-1-2',
            name: 'Routes of Administration',
            description: 'Different ways drugs enter the body.',
            chapterId: 'ch-1',
            order: 2,
            items: []
          }
        ]
      },
      {
        id: 'ch-2',
        name: 'Pharmacokinetics',
        description: 'Absorption, distribution, metabolism, excretion—and how timing changes outcomes.',
        order: 2,
        topics: [
          {
            id: 'tp-2-1',
            name: 'Drug Absorption',
            description: 'How drugs enter the bloodstream.',
            chapterId: 'ch-2',
            order: 1,
            items: []
          },
          {
            id: 'tp-2-2',
            name: 'Drug Distribution',
            description: 'How drugs travel through the body.',
            chapterId: 'ch-2',
            order: 2,
            items: []
          },
          {
            id: 'tp-2-3',
            name: 'Drug Metabolism',
            description: 'How drugs are transformed in the body.',
            chapterId: 'ch-2',
            order: 3,
            items: []
          }
        ]
      },
      {
        id: 'ch-3',
        name: 'Pharmacodynamics',
        description: 'How drugs produce their effects on the body.',
        order: 3,
        topics: [
          {
            id: 'tp-3-1',
            name: 'Receptor Theory',
            description: 'Agonists, antagonists, partial agonists, and inverse agonists.',
            chapterId: 'ch-3',
            order: 1,
            items: []
          },
          {
            id: 'tp-3-2',
            name: 'Signal Transduction',
            description: 'G-proteins, second messengers, and downstream effects.',
            chapterId: 'ch-3',
            order: 2,
            items: []
          }
        ]
      }
    ];
    saveChapters(sampleChapters);
  }
};
