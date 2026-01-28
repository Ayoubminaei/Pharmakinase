import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Beaker, Pill, Zap, ExternalLink, X, Filter } from 'lucide-react';
import type { Chapter, StudyItem, ItemType } from '@/types';
import gsap from 'gsap';

interface SearchPageProps {
  chapters: Chapter[];
  onSearch: (query: string) => Promise<StudyItem[]>;
  onItemClick: (item: StudyItem) => void;
}

export const SearchPage = ({ chapters, onSearch, onItemClick }: SearchPageProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudyItem[]>([]);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const doSearch = async () => {
      if (query.trim()) {
        const searchResults = await onSearch(query);
        setResults(searchResults);
        setHasSearched(true);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    };
    doSearch();
  }, [query, onSearch]);

  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      const cards = resultsRef.current.children;
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [results]);

  const filteredResults = selectedType === 'all' 
    ? results 
    : results.filter(item => item.type === selectedType);

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case 'molecule':
        return <Beaker className="w-5 h-5" />;
      case 'enzyme':
        return <Zap className="w-5 h-5" />;
      case 'medication':
        return <Pill className="w-5 h-5" />;
    }
  };

  const getItemColor = (type: ItemType) => {
    switch (type) {
      case 'molecule':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'enzyme':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'medication':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
  };

  const getChapterName = (chapterId: string) => {
    return chapters.find(ch => ch.id === chapterId)?.name || 'Unknown Chapter';
  };

  const getTopicName = (chapterId: string, topicId: string) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    return chapter?.topics.find(tp => tp.id === topicId)?.name || 'Unknown Topic';
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#0B1E5B] mb-2">Search</h1>
          <p className="text-[#6B7280]">Find molecules, enzymes, and medications across all your chapters</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-[#6B7280]" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search molecules, enzymes, medications..."
            className="w-full h-16 pl-14 pr-12 text-lg rounded-full border-2 border-[#0B1E5B] focus:border-[#00B8A9] focus:ring-[#00B8A9] shadow-[0_18px_0_rgba(11,30,91,0.05)]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-4 flex items-center"
            >
              <X className="w-5 h-5 text-[#6B7280] hover:text-[#0B1E5B]" />
            </button>
          )}
        </div>

        {/* Filters */}
        {hasSearched && results.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-[#6B7280] mr-1" />
            {(['all', 'molecule', 'enzyme', 'medication'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200
                  ${selectedType === type
                    ? 'bg-[#00B8A9] text-white'
                    : 'bg-white text-[#0B1E5B] border-2 border-[#0B1E5B]/20 hover:border-[#00B8A9]'
                  }
                `}
              >
                {type === 'all' ? 'All Types' : `${type}s`}
                <span className="ml-2 text-xs opacity-70">
                  {type === 'all' 
                    ? results.length 
                    : results.filter(i => i.type === type).length
                  }
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {hasSearched ? (
          filteredResults.length > 0 ? (
            <div ref={resultsRef} className="space-y-4">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="group bg-white rounded-[22px] border-2 border-[#0B1E5B] p-5 cursor-pointer transition-all duration-300 hover:shadow-[0_18px_0_rgba(11,30,91,0.10)] hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    {/* Image or Icon */}
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border-2 border-[#0B1E5B]/10"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${getItemColor(item.type)}`}>
                        {getItemIcon(item.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#6B7280] uppercase tracking-wider font-medium capitalize">
                          {item.type}
                        </span>
                        <span className="text-[#0B1E5B]/30">•</span>
                        <span className="text-xs text-[#6B7280]">
                          {getChapterName(item.chapterId)}
                        </span>
                        <span className="text-[#0B1E5B]/30">•</span>
                        <span className="text-xs text-[#6B7280]">
                          {getTopicName(item.chapterId, item.topicId)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-[#0B1E5B] mb-1">
                        {item.name}
                      </h3>
                      
                      {item.scientificName && (
                        <p className="text-sm text-[#6B7280] italic mb-2">
                          {item.scientificName}
                        </p>
                      )}
                      
                      <p className="text-[#6B7280] text-sm line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      {/* Properties Preview */}
                      {item.properties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.properties.slice(0, 3).map((prop, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-[#F6F7FA] rounded-full text-xs text-[#0B1E5B]"
                            >
                              <span className="text-[#6B7280]">{prop.key}:</span>{' '}
                              <span className="font-medium">{prop.value}</span>
                            </span>
                          ))}
                          {item.properties.length > 3 && (
                            <span className="px-3 py-1 bg-[#F6F7FA] rounded-full text-xs text-[#00B8A9]">
                              +{item.properties.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ExternalLink className="w-5 h-5 text-[#00B8A9] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#0B1E5B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-[#0B1E5B]/40" />
              </div>
              <h3 className="text-xl font-medium text-[#0B1E5B]">No results found</h3>
              <p className="text-[#6B7280] mt-2">
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#0B1E5B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-[#0B1E5B]/40" />
            </div>
            <h3 className="text-xl font-medium text-[#0B1E5B]">Start searching</h3>
            <p className="text-[#6B7280] mt-2 max-w-md mx-auto">
              Search by name, scientific name, description, or properties
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.reduce((tacc, tp) => tacc + tp.items.length, 0), 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Total Items</span>
              </div>
              <div className="w-px h-12 bg-[#0B1E5B]/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.reduce((tacc, tp) => tacc + tp.items.filter(i => i.type === 'molecule').length, 0), 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Molecules</span>
              </div>
              <div className="w-px h-12 bg-[#0B1E5B]/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.reduce((tacc, tp) => tacc + tp.items.filter(i => i.type === 'enzyme').length, 0), 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Enzymes</span>
              </div>
              <div className="w-px h-12 bg-[#0B1E5B]/10" />
              <div className="text-center">
                <span className="block text-2xl font-bold text-[#0B1E5B]">
                  {chapters.reduce((acc, ch) => acc + ch.topics.reduce((tacc, tp) => tacc + tp.items.filter(i => i.type === 'medication').length, 0), 0)}
                </span>
                <span className="text-sm text-[#6B7280]">Medications</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};