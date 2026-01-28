import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ChapterPage } from '@/pages/ChapterPage';
import { TopicPage } from '@/pages/TopicPage';
import { AddItemPage } from '@/pages/AddItemPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { QuizPage } from '@/pages/QuizPage';
import { SearchPage } from '@/pages/SearchPage';
import { AdminPage } from '@/pages/AdminPage';
import { Navigation } from '@/components/ui-custom/Navigation';
import { Toaster } from '@/components/ui/sonner';
import type { StudyItem } from '@/types';
import './App.css';

type Page = 'login' | 'dashboard' | 'chapter' | 'topic' | 'add-item' | 'edit-item' | 'flashcards' | 'quiz' | 'search' | 'admin';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<StudyItem | null>(null);
  
  const {
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
    searchItems,

  } = useAppState();

  // Check auth on mount
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success) {
      setCurrentPage('dashboard');
    }
    return result;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const result = await register(name, email, password);
    if (result.success) {
      setCurrentPage('dashboard');
    }
    return result;
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
    setSelectedChapterId(null);
    setSelectedTopicId(null);
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const navigateToChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setCurrentPage('chapter');
  };

  const navigateToTopic = (chapterId: string, topicId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedTopicId(topicId);
    setCurrentPage('topic');
  };

  const navigateBack = () => {
    if (currentPage === 'topic') {
      setCurrentPage('chapter');
      setSelectedTopicId(null);
    } else if (currentPage === 'chapter') {
      setCurrentPage('dashboard');
      setSelectedChapterId(null);
    } else if (currentPage === 'add-item' || currentPage === 'edit-item') {
      setCurrentPage('topic');
    }
  };

  const handleAddItem = async (_chapterId: string, topicId: string, itemData: any) => {
    await addItem(topicId, itemData);
    setCurrentPage('topic');
  };

  const handleEditItem = (item: StudyItem) => {
    setEditingItem(item);
    setCurrentPage('edit-item');
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    await updateItem(itemId, updates);
    setEditingItem(null);
    setCurrentPage('topic');
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F7FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B8A9]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FA]">
      {isAuthenticated && (
        <Navigation
          currentPage={currentPage}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          userName={user?.name || ''}
        />
      )}
      
      <main className={isAuthenticated ? 'pt-16' : ''}>
        {currentPage === 'login' && (
          <LoginPage 
            onRegister={handleRegister}
            onLoginSubmit={handleLogin}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <DashboardPage
            chapters={chapters}
            onChapterClick={navigateToChapter}
            onAddChapter={addChapter}
            onUpdateChapter={updateChapter}
            onDeleteChapter={deleteChapter}
          />
        )}
        
        {currentPage === 'chapter' && selectedChapterId && (
          <ChapterPage
            chapterId={selectedChapterId}
            chapters={chapters}
            onTopicClick={(topicId) => navigateToTopic(selectedChapterId, topicId)}
            onAddTopic={addTopic}
            onUpdateTopic={updateTopic}
            onDeleteTopic={deleteTopic}
            onBack={navigateBack}
          />
        )}
        
        {currentPage === 'topic' && selectedChapterId && selectedTopicId && (
          <TopicPage
            chapterId={selectedChapterId}
            topicId={selectedTopicId}
            chapters={chapters}
            onBack={navigateBack}
            onAddItemClick={() => {
              setEditingItem(null);
              setCurrentPage('add-item');
            }}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
        
        {(currentPage === 'add-item' || currentPage === 'edit-item') && selectedChapterId && selectedTopicId && (
          <AddItemPage
            chapters={chapters}
            editingItem={editingItem}
            chapterId={selectedChapterId}
            topicId={selectedTopicId}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onCancel={navigateBack}
          />
        )}
        
        {currentPage === 'flashcards' && (
          <FlashcardsPage
            chapters={chapters}
            flashcards={flashcards}
            onAddFlashcard={addFlashcard}
          />
        )}
        
        {currentPage === 'quiz' && (
          <QuizPage
            chapters={chapters}
            quizzes={quizzes}
          />
        )}
        
        {currentPage === 'search' && (
          <SearchPage
            chapters={chapters}
            onSearch={async (query) => await searchItems(query)}
            onItemClick={(item) => {
              setSelectedChapterId(item.chapterId);
              setSelectedTopicId(item.topicId);
              setCurrentPage('topic');
            }}
          />
        )}
        
        {currentPage === 'admin' && (
          <AdminPage onBack={() => setCurrentPage('dashboard')} />
        )}
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
