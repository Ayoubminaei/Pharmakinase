// API Service for connecting to the backend
// IMPORTANT: Set VITE_API_URL in your environment variables!
// Example: VITE_API_URL=https://your-app.railway.app/api

const API_URL = import.meta.env.VITE_API_URL || '';

// Debug mode - logs all API calls
const DEBUG = true;

// Helper to get auth token
const getToken = () => localStorage.getItem('pharmastudy_token');

// Check if backend is configured
const isBackendConfigured = () => {
  if (!API_URL) {
    console.error('❌ VITE_API_URL is not set!');
    console.error('Please set VITE_API_URL in your environment variables.');
    console.error('Example: VITE_API_URL=https://your-app.railway.app/api');
    return false;
  }
  return true;
};

// Generic fetch with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  if (!isBackendConfigured()) {
    throw new Error('Backend not configured. Please set VITE_API_URL environment variable.');
  }

  const token = getToken();
  const url = `${API_URL}${endpoint}`;
  
  if (DEBUG) {
    console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        // Response body is not JSON
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    if (DEBUG) {
      console.error(`❌ API Error (${endpoint}):`, error.message);
    }
    throw error;
  }
};

// ========== LOCAL STORAGE FALLBACK MODE ==========
// This mode is used when backend is not available
// Data is stored in browser's localStorage

const getLocalUsers = () => {
  const users = localStorage.getItem('pharmastudy_users');
  return users ? JSON.parse(users) : [];
};

const saveLocalUsers = (users: any[]) => {
  localStorage.setItem('pharmastudy_users', JSON.stringify(users));
};

// Auth API - with fallback to localStorage
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    // Try backend first
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
      } catch (error: any) {
        console.log('Backend register failed, using localStorage fallback');
      }
    }
    
    // LocalStorage fallback
    const users = getLocalUsers();
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    const newUser = {
      id: `local-${Date.now()}`,
      name,
      email,
      password, // Note: In production, this should be hashed!
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveLocalUsers(users);
    
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: `local-token-${newUser.id}`,
    };
  },

  login: async (email: string, password: string) => {
    // Try backend first
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } catch (error: any) {
        console.log('Backend login failed, using localStorage fallback');
      }
    }
    
    // LocalStorage fallback
    const users = getLocalUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: `local-token-${user.id}`,
    };
  },

  getMe: async () => {
    // Try backend first
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth('/auth/me');
      } catch (error) {
        // Fallback below
      }
    }
    
    // LocalStorage fallback
    const token = getToken();
    if (!token || !token.startsWith('local-token-')) {
      throw new Error('Not authenticated');
    }
    
    const userId = token.replace('local-token-', '');
    const users = getLocalUsers();
    const user = users.find((u: any) => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  },
  
  // Get all registered users (for admin view)
  getAllUsers: () => {
    const users = getLocalUsers();
    return users.map(({ password: _, ...user }: any) => user);
  },
};

// ========== CHAPTERS API ==========
const getLocalChapters = () => {
  const chapters = localStorage.getItem('pharmastudy_chapters');
  return chapters ? JSON.parse(chapters) : [];
};

const saveLocalChapters = (chapters: any[]) => {
  localStorage.setItem('pharmastudy_chapters', JSON.stringify(chapters));
};

export const chaptersApi = {
  getAll: async () => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth('/chapters');
      } catch (error) {
        // Fallback
      }
    }
    return getLocalChapters();
  },
  
  create: async (name: string, description: string, color?: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth('/chapters', {
          method: 'POST',
          body: JSON.stringify({ name, description, color }),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    const newChapter = {
      id: `ch-${Date.now()}`,
      name,
      description,
      color,
      order: chapters.length + 1,
      topics: [],
      createdAt: new Date().toISOString(),
    };
    chapters.push(newChapter);
    saveLocalChapters(chapters);
    return newChapter;
  },
  
  update: async (id: string, data: any) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/chapters/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    const index = chapters.findIndex((c: any) => c.id === id);
    if (index === -1) throw new Error('Chapter not found');
    
    chapters[index] = { ...chapters[index], ...data };
    saveLocalChapters(chapters);
    return chapters[index];
  },
  
  delete: async (id: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/chapters/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    const filtered = chapters.filter((c: any) => c.id !== id);
    saveLocalChapters(filtered);
    return { message: 'Chapter deleted' };
  },
};

// ========== TOPICS API ==========
export const topicsApi = {
  create: async (chapterId: string, name: string, description: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/topics/${chapterId}`, {
          method: 'POST',
          body: JSON.stringify({ name, description }),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    const chapter = chapters.find((c: any) => c.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');
    
    const newTopic = {
      id: `tp-${Date.now()}`,
      name,
      description,
      chapterId,
      order: (chapter.topics?.length || 0) + 1,
      items: [],
      createdAt: new Date().toISOString(),
    };
    
    chapter.topics = chapter.topics || [];
    chapter.topics.push(newTopic);
    saveLocalChapters(chapters);
    return newTopic;
  },
  
  update: async (id: string, data: any) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/topics/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    for (const chapter of chapters) {
      const topicIndex = chapter.topics?.findIndex((t: any) => t.id === id);
      if (topicIndex !== -1 && topicIndex !== undefined) {
        chapter.topics[topicIndex] = { ...chapter.topics[topicIndex], ...data };
        saveLocalChapters(chapters);
        return chapter.topics[topicIndex];
      }
    }
    throw new Error('Topic not found');
  },
  
  delete: async (id: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/topics/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    for (const chapter of chapters) {
      const initialLength = chapter.topics?.length || 0;
      chapter.topics = chapter.topics?.filter((t: any) => t.id !== id) || [];
      if (chapter.topics.length < initialLength) {
        saveLocalChapters(chapters);
        return { message: 'Topic deleted' };
      }
    }
    throw new Error('Topic not found');
  },
};

// ========== ITEMS API ==========
export const itemsApi = {
  create: async (topicId: string, data: any) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/items/${topicId}`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    for (const chapter of chapters) {
      for (const topic of chapter.topics || []) {
        if (topic.id === topicId) {
          const newItem = {
            id: `item-${Date.now()}`,
            ...data,
            topicId,
            chapterId: chapter.id,
            createdAt: new Date().toISOString(),
          };
          topic.items = topic.items || [];
          topic.items.push(newItem);
          saveLocalChapters(chapters);
          return newItem;
        }
      }
    }
    throw new Error('Topic not found');
  },
  
  update: async (id: string, data: any) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/items/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    for (const chapter of chapters) {
      for (const topic of chapter.topics || []) {
        const itemIndex = topic.items?.findIndex((i: any) => i.id === id);
        if (itemIndex !== -1 && itemIndex !== undefined) {
          topic.items[itemIndex] = { ...topic.items[itemIndex], ...data };
          saveLocalChapters(chapters);
          return topic.items[itemIndex];
        }
      }
    }
    throw new Error('Item not found');
  },
  
  delete: async (id: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/items/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        // Fallback
      }
    }
    
    const chapters = getLocalChapters();
    for (const chapter of chapters) {
      for (const topic of chapter.topics || []) {
        const initialLength = topic.items?.length || 0;
        topic.items = topic.items?.filter((i: any) => i.id !== id) || [];
        if (topic.items.length < initialLength) {
          saveLocalChapters(chapters);
          return { message: 'Item deleted' };
        }
      }
    }
    throw new Error('Item not found');
  },
  
  uploadImage: async (file: File) => {
    // For localStorage mode, convert to base64
    if (!isBackendConfigured()) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ imageUrl: reader.result });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    // Backend upload
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/items/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error);
    }

    return response.json();
  },
};

// ========== FLASHCARDS & SEARCH ==========
export const flashcardsApi = {
  getAll: () => fetchWithAuth('/flashcards').catch(() => []),
  create: (itemId: string, front: string, back: string) =>
    fetchWithAuth('/flashcards', {
      method: 'POST',
      body: JSON.stringify({ itemId, front, back }),
    }).catch(() => ({})),
  update: (id: string, front: string, back: string) =>
    fetchWithAuth(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ front, back }),
    }).catch(() => ({})),
  delete: (id: string) =>
    fetchWithAuth(`/flashcards/${id}`, {
      method: 'DELETE',
    }).catch(() => ({})),
};

export const searchApi = {
  search: async (query: string, type?: string) => {
    if (isBackendConfigured()) {
      try {
        return await fetchWithAuth(`/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`);
      } catch (error) {
        // Fallback to local search
      }
    }
    
    // Local search
    const chapters = getLocalChapters();
    const items: any[] = [];
    chapters.forEach((ch: any) => {
      ch.topics?.forEach((tp: any) => {
        tp.items?.forEach((item: any) => {
          const match = 
            item.name?.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase()) ||
            item.scientificName?.toLowerCase().includes(query.toLowerCase());
          if (match && (!type || item.type === type)) {
            items.push({ ...item, chapterId: ch.id, topicId: tp.id });
          }
        });
      });
    });
    return { items, chapters: [], topics: [] };
  },
};

// Export debug info
export const getApiStatus = () => ({
  apiUrl: API_URL,
  isConfigured: isBackendConfigured(),
  token: getToken(),
  localUsers: getLocalUsers().length,
  localChapters: getLocalChapters().length,
});
