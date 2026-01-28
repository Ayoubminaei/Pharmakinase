import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Layers, Eye, EyeOff, Bookmark, ImageOff } from 'lucide-react';
import type { Chapter, Flashcard } from '@/types';
import gsap from 'gsap';

interface FlashcardsPageProps {
  chapters: Chapter[];
  flashcards: Flashcard[];
  onAddFlashcard: (flashcard: Flashcard) => void;
}

interface ExtendedFlashcard {
  id: string;
  itemId: string;
  front: string;
  back: string;
  chapterId?: string;
  topicId?: string;
  mastered: boolean;
  lastReviewed?: Date;
  itemName?: string;
  itemDescription?: string;
  itemImageUrl?: string;
  itemType?: string;
  itemScientificName?: string;
  itemProperties?: { key: string; value: string }[];
}

export const FlashcardsPage = ({ chapters, flashcards, onAddFlashcard }: FlashcardsPageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate flashcards from items with images
  const generateFlashcards = (): ExtendedFlashcard[] => {
    const generated: ExtendedFlashcard[] = [];
    
    chapters.forEach(ch => {
      ch.topics?.forEach(tp => {
        tp.items?.forEach(item => {
          if (item.imageUrl) {
            generated.push({
              id: `fc-img-${item.id}`,
              itemId: item.id,
              front: '',
              back: '',
              chapterId: ch.id,
              topicId: tp.id,
              mastered: false,
              itemName: item.name,
              itemDescription: item.description,
              itemScientificName: item.scientificName,
              itemImageUrl: item.imageUrl,
              itemType: item.type,
              itemProperties: item.properties,
            });
          }
        });
      });
    });
    
    return generated;
  };

  const allFlashcards: ExtendedFlashcard[] = [
    ...flashcards.map(fc => ({ 
      ...fc, 
      itemName: '', 
      itemDescription: '',
      itemImageUrl: undefined,
      itemType: undefined,
      itemScientificName: undefined,
      itemProperties: undefined
    })), 
    ...generateFlashcards()
  ];

  // Filter flashcards
  const filteredFlashcards = allFlashcards.filter(fc => {
    if (selectedChapterId === 'all') return true;
    if (fc.chapterId !== selectedChapterId) return false;
    if (selectedTopicId === 'all') return true;
    return fc.topicId === selectedTopicId;
  });

  const currentCard = filteredFlashcards[currentIndex];
  const isImageCard = currentCard?.itemImageUrl && !currentCard.front;

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedChapterId, selectedTopicId]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { rotateY: isFlipped ? 0 : 180, opacity: 0.8 },
        { rotateY: isFlipped ? 180 : 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [isFlipped]);

  useEffect(() => {
    setIsFlipped(false);
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { x: 80, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < filteredFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const selectedChapter = chapters.find(ch => ch.id === selectedChapterId);
  const availableTopics = selectedChapter?.topics || [];

  if (allFlashcards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#0B1E5B]">Flashcards</h1>
            <p className="text-[#6B7280] mt-2">Study with image-based flashcards</p>
          </div>
          
          <div className="text-center py-20 bg-white rounded-[22px] border-2 border-[#0B1E5B]/10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-10 h-10 text-[#667eea]" />
            </div>
            <h3 className="text-xl font-medium text-[#0B1E5B]">No flashcards yet</h3>
            <p className="text-[#6B7280] mt-2 max-w-md mx-auto">
              Add items with images to create visual flashcards. The image will be the question, and the name + description will be the answer!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B1E5B]">Visual Flashcards</h1>
          <p className="text-[#6B7280] mt-2">Guess the molecule, enzyme, or medication from its image</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedChapterId}
            onChange={(e) => {
              setSelectedChapterId(e.target.value);
              setSelectedTopicId('all');
            }}
            className="px-4 py-2.5 rounded-full border-2 border-[#0B1E5B]/20 bg-white text-[#0B1E5B] text-sm"
          >
            <option value="all">All Chapters</option>
            {chapters.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.name}</option>
            ))}
          </select>
          
          {selectedChapterId !== 'all' && (
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="px-4 py-2.5 rounded-full border-2 border-[#0B1E5B]/20 bg-white text-[#0B1E5B] text-sm"
            >
              <option value="all">All Topics</option>
              {availableTopics.map(tp => (
                <option key={tp.id} value={tp.id}>{tp.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#6B7280]">
              Card <span className="font-semibold text-[#0B1E5B]">{currentIndex + 1}</span> of {filteredFlashcards.length}
            </span>
            <div className="flex gap-1">
              {filteredFlashcards.slice(0, 20).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-[#667eea] w-4' : 'bg-[#0B1E5B]/20'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            onClick={() => currentCard && onAddFlashcard({ ...currentCard, mastered: !currentCard.mastered })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentCard?.mastered
                ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white'
                : 'bg-white border-2 border-[#0B1E5B]/20 text-[#0B1E5B]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${currentCard?.mastered ? 'fill-current' : ''}`} />
            {currentCard?.mastered ? 'Mastered' : 'Mark Mastered'}
          </button>
        </div>

        {/* Flashcard */}
        {filteredFlashcards.length > 0 ? (
          <>
            <div className="relative mb-8" style={{ perspective: '1200px' }}>
              <div
                ref={cardRef}
                onClick={handleFlip}
                className="relative bg-white rounded-[32px] border-2 border-[#0B1E5B] shadow-[0_24px_48px_rgba(11,30,91,0.15)] min-h-[500px] cursor-pointer transition-shadow hover:shadow-[0_32px_64px_rgba(11,30,91,0.2)] overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front - Image Question */}
                <div
                  className={`absolute inset-0 flex flex-col ${
                    isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-white/80" />
                      <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                        What is this?
                      </span>
                    </div>
                    {currentCard?.itemType && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs capitalize">
                        {currentCard.itemType}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
                    {isImageCard ? (
                      <div className="relative">
                        <img
                          src={currentCard.itemImageUrl}
                          alt="Flashcard"
                          className="max-w-full max-h-[320px] object-contain rounded-2xl shadow-lg"
                        />
                        <div className="absolute -inset-3 border-2 border-dashed border-[#667eea]/30 rounded-3xl pointer-events-none" />
                      </div>
                    ) : (
                      <div className="text-center max-w-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Layers className="w-8 h-8 text-[#667eea]" />
                        </div>
                        <p className="text-xl sm:text-2xl font-semibold text-[#0B1E5B]">
                          {currentCard.front}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 text-center border-t border-gray-100">
                    <p className="text-sm text-[#6B7280]">Click to reveal answer</p>
                  </div>
                </div>

                {/* Back - Name, Scientific Name & Description Answer */}
                <div
                  className={`absolute inset-0 flex flex-col ${
                    isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="bg-gradient-to-r from-[#00B8A9] to-[#00a396] p-4 flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-white/80" />
                    <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                      Answer
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col p-8 bg-gradient-to-br from-[#00B8A9]/5 to-white overflow-y-auto">
                    {isImageCard ? (
                      <div className="text-center">
                        {/* Name */}
                        <div className="mb-4">
                          <span className="text-xs text-[#6B7280] uppercase tracking-wider mb-2 block">
                            Name
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1E5B]">
                            {currentCard.itemName}
                          </h2>
                        </div>

                        {/* Scientific Name */}
                        {currentCard.itemScientificName && (
                          <div className="mb-4">
                            <p className="text-lg text-[#6B7280] italic">
                              {currentCard.itemScientificName}
                            </p>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="w-24 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full mx-auto mb-6" />

                        {/* Description */}
                        <div className="max-w-lg mx-auto text-left">
                          <span className="text-xs text-[#6B7280] uppercase tracking-wider mb-2 block">
                            Description
                          </span>
                          <p className="text-base text-[#0B1E5B]/80 leading-relaxed">
                            {currentCard.itemDescription}
                          </p>
                        </div>

                        {/* Properties */}
                        {currentCard.itemProperties && currentCard.itemProperties.length > 0 && (
                          <div className="mt-6 max-w-lg mx-auto text-left">
                            <span className="text-xs text-[#6B7280] uppercase tracking-wider mb-2 block">
                              Properties
                            </span>
                            <div className="bg-white/50 rounded-xl p-4">
                              {currentCard.itemProperties.map((prop, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                  <span className="text-sm text-[#6B7280]">{prop.key}</span>
                                  <span className="text-sm font-medium text-[#0B1E5B]">{prop.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00B8A9]/10 to-[#00a396]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <EyeOff className="w-8 h-8 text-[#00B8A9]" />
                        </div>
                        <p className="text-xl sm:text-2xl font-semibold text-[#0B1E5B] max-w-lg">
                          {currentCard.back}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 text-center border-t border-gray-100">
                    <p className="text-sm text-[#6B7280]">Click to see question</p>
                  </div>
                </div>
              </div>

              {/* Decorative deck cards */}
              <div className="absolute -z-10 bg-white rounded-[32px] border-2 border-[#0B1E5B]/30" style={{ top: '12px', left: '18px', right: '-14px', bottom: '-12px' }} />
              <div className="absolute -z-20 bg-white rounded-[32px] border-2 border-[#0B1E5B]/10" style={{ top: '24px', left: '28px', right: '-28px', bottom: '-24px' }} />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                variant="outline"
                className="h-14 px-8 rounded-full border-2 border-[#0B1E5B] text-[#0B1E5B] hover:bg-gradient-to-r hover:from-[#667eea] hover:to-[#764ba2] hover:text-white disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleFlip}
                className="h-14 px-10 rounded-full bg-gradient-to-r from-[#00B8A9] to-[#00a396] text-white shadow-lg"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                Flip Card
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentIndex === filteredFlashcards.length - 1}
                variant="outline"
                className="h-14 px-8 rounded-full border-2 border-[#0B1E5B] text-[#0B1E5B] hover:bg-gradient-to-r hover:from-[#667eea] hover:to-[#764ba2] hover:text-white disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-center text-sm text-[#6B7280] mt-6">
              Tip: Items with images will show the image as the question. Add images to your items for visual flashcards!
            </p>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-[22px] border-2 border-[#0B1E5B]/10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[#6B7280]">No flashcards match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
