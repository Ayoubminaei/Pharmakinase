import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, ChevronRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import type { Chapter } from '@/types';
import gsap from 'gsap';

interface DashboardPageProps {
  chapters: Chapter[];
  onChapterClick: (chapterId: string) => void;
  onAddChapter: (name: string, description: string) => Promise<Chapter>;
  onUpdateChapter: (chapterId: string, updates: Partial<Chapter>) => Promise<Chapter>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
}

export const DashboardPage = ({ 
  chapters, 
  onChapterClick, 
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter
}: DashboardPageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterDescription, setNewChapterDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [chapters]);

  const handleAddChapter = async () => {
    if (!newChapterName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddChapter(newChapterName.trim(), newChapterDescription.trim());
      setNewChapterName('');
      setNewChapterDescription('');
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapter(chapter);
    setNewChapterName(chapter.name);
    setNewChapterDescription(chapter.description);
    setIsEditDialogOpen(true);
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !newChapterName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateChapter(editingChapter.id, {
        name: newChapterName.trim(),
        description: newChapterDescription.trim()
      });
      setIsEditDialogOpen(false);
      setEditingChapter(null);
      setNewChapterName('');
      setNewChapterDescription('');
    } catch (error) {
      // Error handled in hook
    }
    setIsSubmitting(false);
  };

  const handleDeleteClick = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChapter(chapter);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChapter) return;
    setIsSubmitting(true);
    try {
      await onDeleteChapter(deletingChapter.id);
      setIsDeleteDialogOpen(false);
      setDeletingChapter(null);
    } catch (error) {
      // Error handled in hook
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#0B1E5B]">Your Chapters</h1>
            <p className="text-[#6B7280] mt-1">Organize your pharmacy studies by chapters</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full px-6 flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            Add Chapter
          </Button>
        </div>

        {/* Chapters Grid */}
        {chapters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[#0B1E5B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-[#0B1E5B]/40" />
            </div>
            <h3 className="text-xl font-medium text-[#0B1E5B]">No chapters yet</h3>
            <p className="text-[#6B7280] mt-2">Create your first chapter to get started</p>
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => onChapterClick(chapter.id)}
                className="group bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_18px_0_rgba(11,30,91,0.10)] hover:-translate-y-1"
              >
                {/* Chapter Number & Actions */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00B8A9]/10 text-[#00B8A9] font-semibold text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditClick(chapter, e)}
                      className="p-2 hover:bg-[#00B8A9]/10 rounded-full transition-colors"
                      title="Edit chapter"
                    >
                      <Edit2 className="w-4 h-4 text-[#00B8A9]" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(chapter, e)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#0B1E5B] mb-2 line-clamp-2">
                  {chapter.name}
                </h3>
                <p className="text-[#6B7280] text-sm line-clamp-2 mb-4">
                  {chapter.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[#0B1E5B]/10">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-semibold text-[#0B1E5B]">{chapter.topics?.length || 0}</span>
                      <span className="text-[#6B7280] ml-1">topics</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-[#0B1E5B]">
                        {chapter.topics?.reduce((acc, tp) => acc + (tp.items?.length || 0), 0) || 0}
                      </span>
                      <span className="text-[#6B7280] ml-1">items</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#00B8A9] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Chapter Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-[#0B1E5B]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#0B1E5B]">Add New Chapter</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                Create a new chapter to organize your study materials.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Chapter Name</Label>
                <Input
                  placeholder="e.g., Pharmacokinetics"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#0B1E5B]/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Description</Label>
                <Textarea
                  placeholder="Brief description of this chapter..."
                  value={newChapterDescription}
                  onChange={(e) => setNewChapterDescription(e.target.value)}
                  className="min-h-[100px] rounded-xl border-2 border-[#0B1E5B]/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 h-12 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddChapter}
                  disabled={!newChapterName.trim() || isSubmitting}
                  className="flex-1 h-12 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Chapter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Chapter Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-[#0B1E5B]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#0B1E5B]">Edit Chapter</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                Update chapter details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Chapter Name</Label>
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#0B1E5B]/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Description</Label>
                <Textarea
                  value={newChapterDescription}
                  onChange={(e) => setNewChapterDescription(e.target.value)}
                  className="min-h-[100px] rounded-xl border-2 border-[#0B1E5B]/20 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 h-12 rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateChapter}
                  disabled={!newChapterName.trim() || isSubmitting}
                  className="flex-1 h-12 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-red-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-red-600">Delete Chapter?</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                This will permanently delete <strong>{deletingChapter?.name}</strong> and all its topics and items. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 h-12 rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
