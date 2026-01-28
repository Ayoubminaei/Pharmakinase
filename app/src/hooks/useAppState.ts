import { useState, useEffect, useCallback } from 'react';
import type { Chapter, Flashcard, Quiz, User, StudyItem, Topic } from '@/types';
import { authApi, chaptersApi, topicsApi, itemsApi, searchApi } from '@/services/api';
import { toast } from 'sonner';

const TOKEN_KEY = 'pharmastudy_token';
const USER_KEY = 'pharmastudy_user';

export const useAppState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize - check for saved token
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      
      if (token && savedUser) {
        try {
          // Verify token is valid
          const { user } = await authApi.getMe();
          setUser(user);
          setIsAuthenticated(true);
          // Load chapters
          await loadChapters();
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      setIsLoading(false);
    };
    
    init();
  }, []);

  const loadChapters = async () => {
    try {
      const data = await chaptersApi.getAll();
      setChapters(data);
    } catch (error) {
      console.error('Failed to load chapters:', error);
      toast.error('Failed to load chapters');
    }
  };

  // Auth functions
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user, token } = await authApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      await loadChapters();
      toast.success('Login successful!');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { user, token } = await authApi.register(name, email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      await loadChapters();
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setChapters([]);
    toast.success('Logged out');
  }, []);

  // Chapter functions
  const addChapter = useCallback(async (name: string, description: string) => {
    try {
      const chapter = await chaptersApi.create(name, description);
      setChapters(prev => [...prev, chapter]);
      toast.success('Chapter created!');
      return chapter;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create chapter');
      throw error;
    }
  }, []);

  const updateChapter = useCallback(async (chapterId: string, updates: Partial<Chapter>) => {
    try {
      const updated = await chaptersApi.update(chapterId, updates);
      setChapters(prev => prev.map(ch => ch.id === chapterId ? updated : ch));
      toast.success('Chapter updated!');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update chapter');
      throw error;
    }
  }, []);

  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      await chaptersApi.delete(chapterId);
      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
      toast.success('Chapter deleted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete chapter');
      throw error;
    }
  }, []);

  // Topic functions
  const addTopic = useCallback(async (chapterId: string, name: string, description: string) => {
    try {
      const topic = await topicsApi.create(chapterId, name, description);
      setChapters(prev => prev.map(ch => {
        if (ch.id === chapterId) {
          return { ...ch, topics: [...ch.topics, topic] };
        }
        return ch;
      }));
      toast.success('Topic created!');
      return topic;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create topic');
      throw error;
    }
  }, []);

  const updateTopic = useCallback(async (topicId: string, updates: Partial<Topic>) => {
    try {
      const updated = await topicsApi.update(topicId, updates);
      setChapters(prev => prev.map(ch => ({
        ...ch,
        topics: ch.topics.map(tp => tp.id === topicId ? updated : tp)
      })));
      toast.success('Topic updated!');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update topic');
      throw error;
    }
  }, []);

  const deleteTopic = useCallback(async (topicId: string) => {
    try {
      await topicsApi.delete(topicId);
      setChapters(prev => prev.map(ch => ({
        ...ch,
        topics: ch.topics.filter(tp => tp.id !== topicId)
      })));
      toast.success('Topic deleted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete topic');
      throw error;
    }
  }, []);

  // Item functions
  const addItem = useCallback(async (topicId: string, itemData: {
    name: string;
    scientificName?: string;
    type: string;
    description: string;
    imageUrl?: string;
    properties?: { key: string; value: string }[];
    flashcardFront?: string;
    flashcardBack?: string;
  }) => {
    try {
      const item = await itemsApi.create(topicId, itemData);
      setChapters(prev => prev.map(ch => ({
        ...ch,
        topics: ch.topics.map(tp => {
          if (tp.id === topicId) {
            return { ...tp, items: [...tp.items, item] };
          }
          return tp;
        })
      })));
      toast.success('Item added!');
      return item;
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item');
      throw error;
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, updates: {
    name?: string;
    scientificName?: string;
    type?: string;
    description?: string;
    imageUrl?: string;
    properties?: { key: string; value: string }[];
  }) => {
    try {
      const updated = await itemsApi.update(itemId, updates);
      setChapters(prev => prev.map(ch => ({
        ...ch,
        topics: ch.topics.map(tp => ({
          ...tp,
          items: tp.items.map(it => it.id === itemId ? updated : it)
        }))
      })));
      toast.success('Item updated!');
      return updated;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item');
      throw error;
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await itemsApi.delete(itemId);
      setChapters(prev => prev.map(ch => ({
        ...ch,
        topics: ch.topics.map(tp => ({
          ...tp,
          items: tp.items.filter(it => it.id !== itemId)
        }))
      })));
      toast.success('Item deleted!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
      throw error;
    }
  }, []);

  // Flashcard functions (local for now)
  const addFlashcard = useCallback((flashcard: Flashcard) => {
    setFlashcards(prev => [...prev, flashcard]);
  }, []);

  const updateFlashcard = useCallback((flashcardId: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(fc => 
      fc.id === flashcardId ? { ...fc, ...updates } : fc
    ));
  }, []);

  const deleteFlashcard = useCallback((flashcardId: string) => {
    setFlashcards(prev => prev.filter(fc => fc.id !== flashcardId));
  }, []);

  // Quiz functions
  const addQuiz = useCallback((quiz: Quiz) => {
    setQuizzes(prev => [...prev, quiz]);
  }, []);

  const updateQuiz = useCallback((quizId: string, updates: Partial<Quiz>) => {
    setQuizzes(prev => prev.map(qz => 
      qz.id === quizId ? { ...qz, ...updates } : qz
    ));
  }, []);

  const deleteQuiz = useCallback((quizId: string) => {
    setQuizzes(prev => prev.filter(qz => qz.id !== quizId));
  }, []);

  // Search function
  const searchItems = useCallback(async (query: string): Promise<StudyItem[]> => {
    try {
      const { items } = await searchApi.search(query);
      return items;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }, []);

  // Get all items flattened
  const getAllItems = useCallback((): StudyItem[] => {
    const items: StudyItem[] = [];
    chapters.forEach(ch => {
      ch.topics.forEach(tp => {
        items.push(...tp.items);
      });
    });
    return items;
  }, [chapters]);

  // Get items by chapter/topic
  const getItemsByTopic = useCallback((chapterId: string, topicId: string): StudyItem[] => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    const topic = chapter?.topics.find(tp => tp.id === topicId);
    return topic?.items || [];
  }, [chapters]);

  return {
    user,
    chapters,
    flashcards,
    quizzes,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    addChapter,
    updateChapter,
    deleteChapter,
    addTopic,
    updateTopic,
    deleteTopic,
    addItem,
    updateItem,
    deleteItem,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    searchItems,
    getAllItems,
    getItemsByTopic,
    refreshChapters: loadChapters,
  };
};
