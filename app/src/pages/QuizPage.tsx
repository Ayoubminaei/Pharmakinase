import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, Trophy, AlertCircle } from 'lucide-react';
import type { Chapter, Quiz, QuizQuestion } from '@/types';
import { toast } from 'sonner';

interface QuizPageProps {
  chapters: Chapter[];
  quizzes?: Quiz[];
  onAddQuiz?: (quiz: Quiz) => void;
}

interface QuizState {
  currentQuestion: number;
  selectedAnswer: number | null;
  answers: number[];
  showResult: boolean;
  score: number;
}

export const QuizPage = ({ chapters }: QuizPageProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    selectedAnswer: null,
    answers: [],
    showResult: false,
    score: 0,
  });
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  // Generate quiz questions from items
  const generateQuestions = (): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    chapters.forEach(ch => {
      if (selectedChapterId !== 'all' && ch.id !== selectedChapterId) return;
      
      ch.topics.forEach(tp => {
        if (selectedTopicId !== 'all' && tp.id !== selectedTopicId) return;
        
        tp.items.forEach(item => {
          // Generate question based on item type
          if (item.flashcardFront && item.flashcardBack) {
            // Use flashcard as question
            const options = [item.flashcardBack];
            
            // Add distractors from other items
            const otherItems = chapters
              .flatMap(c => c.topics)
              .flatMap(t => t.items)
              .filter(i => i.id !== item.id && i.flashcardBack)
              .slice(0, 3);
            
            otherItems.forEach(i => {
              if (i.flashcardBack) options.push(i.flashcardBack);
            });
            
            // Shuffle options
            const shuffled = options.sort(() => Math.random() - 0.5);
            
            questions.push({
              id: `q-${item.id}`,
              question: item.flashcardFront,
              options: shuffled.slice(0, 4),
              correctAnswer: shuffled.indexOf(item.flashcardBack),
              explanation: `Correct answer: ${item.flashcardBack}`,
              itemId: item.id,
            });
          }
          
          // Generate property-based questions
          item.properties.forEach(prop => {
            if (prop.key.toLowerCase().includes('formula') || 
                prop.key.toLowerCase().includes('mass') ||
                prop.key.toLowerCase().includes('number')) {
              questions.push({
                id: `q-${item.id}-${prop.key}`,
                question: `What is the ${prop.key.toLowerCase()} of ${item.name}?`,
                options: [prop.value, 'Unknown', 'Not applicable', 'Varies'].sort(() => Math.random() - 0.5),
                correctAnswer: 0,
                explanation: `The ${prop.key.toLowerCase()} of ${item.name} is ${prop.value}.`,
                itemId: item.id,
              });
            }
          });
        });
      });
    });
    
    return questions.sort(() => Math.random() - 0.5).slice(0, 10);
  };

  const startQuiz = () => {
    const questions = generateQuestions();
    if (questions.length === 0) {
      toast.error('No quiz questions available for the selected filters');
      return;
    }
    setQuizQuestions(questions);
    setQuizState({
      currentQuestion: 0,
      selectedAnswer: null,
      answers: [],
      showResult: false,
      score: 0,
    });
    setIsQuizStarted(true);
  };

  const handleAnswerSelect = (index: number) => {
    if (quizState.selectedAnswer !== null) return;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: index,
    }));
  };

  const handleNext = () => {
    const currentQ = quizQuestions[quizState.currentQuestion];
    const isCorrect = quizState.selectedAnswer === currentQ.correctAnswer;
    
    const newAnswers = [...quizState.answers, quizState.selectedAnswer!];
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;
    
    if (quizState.currentQuestion < quizQuestions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        answers: newAnswers,
        score: newScore,
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        answers: newAnswers,
        score: newScore,
        showResult: true,
      }));
    }
  };

  const resetQuiz = () => {
    setIsQuizStarted(false);
    setQuizQuestions([]);
    setQuizState({
      currentQuestion: 0,
      selectedAnswer: null,
      answers: [],
      showResult: false,
      score: 0,
    });
  };

  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId);
  const availableTopics = selectedChapter?.topics || [];

  const currentQuestion = quizQuestions[quizState.currentQuestion];

  if (!isQuizStarted) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#0B1E5B]">Quiz</h1>
            <p className="text-[#6B7280] mt-2">Test your knowledge with interactive quizzes</p>
          </div>

          {/* Setup Card */}
          <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#00B8A9]/10 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-[#00B8A9]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0B1E5B]">Start a Quiz</h2>
                <p className="text-[#6B7280]">Select your preferences and begin</p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-[#0B1E5B] mb-2">Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    setSelectedChapterId(e.target.value);
                    setSelectedTopicId('all');
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#0B1E5B]/20 bg-white text-[#0B1E5B] focus:border-[#00B8A9] focus:outline-none"
                >
                  <option value="all">All Chapters</option>
                  {chapters.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#0B1E5B] mb-2">Topic</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={selectedChapterId === 'all'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#0B1E5B]/20 bg-white text-[#0B1E5B] focus:border-[#00B8A9] focus:outline-none disabled:opacity-50"
                >
                  <option value="all">All Topics</option>
                  {availableTopics.map(tp => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-8 p-4 bg-[#F6F7FA] rounded-xl">
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.reduce((tacc, tp) => tacc + tp.items.length, 0), 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Total Items</span>
              </div>
              <div className="w-px h-12 bg-[#0B1E5B]/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">{chapters.length}</span>
                <span className="text-sm text-[#6B7280]">Chapters</span>
              </div>
              <div className="w-px h-12 bg-[#0B1E5B]/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.length, 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Topics</span>
              </div>
            </div>

            <Button
              onClick={startQuiz}
              className="w-full h-14 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full font-semibold text-lg"
            >
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizState.showResult) {
    const percentage = Math.round((quizState.score / quizQuestions.length) * 100);
    
    return (
      <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#0B1E5B]">Quiz Results</h1>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-[#00B8A9]/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-[#00B8A9]" />
            </div>

            <h2 className="text-2xl font-semibold text-[#0B1E5B] mb-2">
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-[#6B7280] mb-8">
              You scored {quizState.score} out of {quizQuestions.length}
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`text-5xl font-bold ${percentage >= 60 ? 'text-[#00B8A9]' : 'text-amber-500'}`}>
                {percentage}%
              </div>
            </div>

            {/* Question Review */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-semibold text-[#0B1E5B] mb-4">Question Review</h3>
              <div className="space-y-3">
                {quizQuestions.map((q, idx) => {
                  const userAnswer = quizState.answers[idx];
                  const isCorrect = userAnswer === q.correctAnswer;
                  
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border-2 ${
                        isCorrect ? 'border-[#00B8A9]/30 bg-[#00B8A9]/5' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-[#00B8A9] flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-[#0B1E5B] mb-1">{q.question}</p>
                          <p className="text-sm text-[#6B7280]">
                            Your answer: {q.options[userAnswer]}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-[#00B8A9] mt-1">
                              Correct answer: {q.options[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={resetQuiz}
              className="h-14 px-8 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full font-semibold"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">
              Question {quizState.currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm text-[#6B7280]">
              Score: {quizState.score}
            </span>
          </div>
          <div className="h-2 bg-[#0B1E5B]/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00B8A9] transition-all duration-300"
              style={{ width: `${((quizState.currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-[#00B8A9]" />
            <span className="text-sm text-[#6B7280] uppercase tracking-wider font-medium">
              Question {quizState.currentQuestion + 1}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-[#0B1E5B] mb-8">
            {currentQuestion?.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = quizState.selectedAnswer === idx;
              const isCorrect = idx === currentQuestion.correctAnswer;
              const showCorrect = quizState.selectedAnswer !== null && isCorrect;
              const showWrong = quizState.selectedAnswer === idx && !isCorrect;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={quizState.selectedAnswer !== null}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${showCorrect
                      ? 'border-[#00B8A9] bg-[#00B8A9]/10'
                      : showWrong
                      ? 'border-red-400 bg-red-50'
                      : isSelected
                      ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                      : 'border-[#0B1E5B]/20 hover:border-[#00B8A9] hover:bg-[#00B8A9]/5'
                    }
                    ${quizState.selectedAnswer !== null && !isSelected && !isCorrect ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${showCorrect
                        ? 'bg-[#00B8A9] text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-[#00B8A9] text-white'
                        : 'bg-[#0B1E5B]/10 text-[#0B1E5B]'
                      }
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium text-[#0B1E5B]">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {quizState.selectedAnswer !== null && currentQuestion?.explanation && (
            <div className="mt-6 p-4 bg-[#F6F7FA] rounded-xl">
              <p className="text-sm text-[#6B7280]">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {quizState.selectedAnswer !== null && (
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              className="h-14 px-8 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full font-semibold"
            >
              {quizState.currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
