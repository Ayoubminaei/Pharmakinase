import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, FolderOpen, ChevronRight, Beaker, Edit2, Trash2, Loader2 } from 'lucide-react';
import type { Chapter, Topic } from '@/types';
import gsap from 'gsap';

interface ChapterPageProps {
  chapterId: string;
  chapters: Chapter[];
  onTopicClick: (topicId: string) => void;
  onAddTopic: (chapterId: string, name: string, description: string) => Promise<Topic>;
  onUpdateTopic: (topicId: string, updates: Partial<Topic>) => Promise<Topic>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  onBack: () => void;
}

export const ChapterPage = ({ 
  chapterId, 
  chapters, 
  onTopicClick, 
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  onBack 
}: ChapterPageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const chapter = chapters.find(ch => ch.id === chapterId);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [chapter]);

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !chapter) return;
    setIsSubmitting(true);
    try {
      await onAddTopic(chapter.id, newTopicName.trim(), newTopicDescription.trim());
      setNewTopicName('');
      setNewTopicDescription('');
      setIsDialogOpen(false);
    } catch (error) {}
    setIsSubmitting(false);
  };

  const handleEditClick = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTopic(topic);
    setNewTopicName(topic.name);
    setNewTopicDescription(topic.description);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic || !newTopicName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateTopic(editingTopic.id, {
        name: newTopicName.trim(),
        description: newTopicDescription.trim()
      });
      setIsEditDialogOpen(false);
      setEditingTopic(null);
      setNewTopicName('');
      setNewTopicDescription('');
    } catch (error) {}
    setIsSubmitting(false);
  };

  const handleDeleteClick = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopic) return;
    setIsSubmitting(true);
    try {
      await onDeleteTopic(deletingTopic.id);
      setIsDeleteDialogOpen(false);
      setDeletingTopic(null);
    } catch (error) {}
    setIsSubmitting(false);
  };

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6B7280]">Chapter not found</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <div ref={contentRef}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#0B1E5B] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Chapters
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#00B8A9]/10 text-[#00B8A9] font-semibold text-xs">
                  {String(chapter.order || 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[#6B7280] uppercase tracking-wider font-medium">Chapter</span>
              </div>
              <h1 className="text-3xl font-semibold text-[#0B1E5B]">{chapter.name}</h1>
              <p className="text-[#6B7280] mt-2 max-w-2xl">{chapter.description}</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full px-6 flex items-center gap-2 self-start"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </Button>
          </div>
        </div>

        {/* Topics List */}
        {(!chapter.topics || chapter.topics.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-[22px] border-2 border-[#0B1E5B]/10">
            <div className="w-20 h-20 bg-[#0B1E5B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-10 h-10 text-[#0B1E5B]/40" />
            </div>
            <h3 className="text-xl font-medium text-[#0B1E5B]">No topics yet</h3>
            <p className="text-[#6B7280] mt-2">Add your first topic to this chapter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapter.topics.map((topic, index) => (
              <div
                key={topic.id}
                onClick={() => onTopicClick(topic.id)}
                className="group bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_18px_0_rgba(11,30,91,0.10)] hover:-translate-y-1 flex items-center gap-6"
              >
                {/* Topic Number */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#00B8A9]/10 flex items-center justify-center">
                  <Beaker className="w-6 h-6 text-[#00B8A9]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#6B7280] uppercase tracking-wider font-medium">
                      Topic {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1E5B] mb-1">
                    {topic.name}
                  </h3>
                  <p className="text-[#6B7280] text-sm line-clamp-1">
                    {topic.description}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-[#0B1E5B]">{topic.items?.length || 0}</span>
                    <span className="text-[#6B7280] ml-1 text-sm">items</span>
                  </div>
                  
                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditClick(topic, e)}
                      className="p-2 hover:bg-[#00B8A9]/10 rounded-full transition-colors"
                      title="Edit topic"
                    >
                      <Edit2 className="w-4 h-4 text-[#00B8A9]" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(topic, e)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  <ChevronRight className="w-6 h-6 text-[#00B8A9] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Topic Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-[#0B1E5B]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#0B1E5B]">Add New Topic</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                Create a new topic in {chapter.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Topic Name</Label>
                <Input
                  placeholder="e.g., Drug Absorption"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#0B1E5B]/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Description</Label>
                <Textarea
                  placeholder="Brief description of this topic..."
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
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
                  onClick={handleAddTopic}
                  disabled={!newTopicName.trim() || isSubmitting}
                  className="flex-1 h-12 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Topic'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Topic Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-[#0B1E5B]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-[#0B1E5B]">Edit Topic</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                Update topic details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Topic Name</Label>
                <Input
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="h-12 rounded-xl border-2 border-[#0B1E5B]/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#0B1E5B] font-medium">Description</Label>
                <Textarea
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
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
                  onClick={handleUpdateTopic}
                  disabled={!newTopicName.trim() || isSubmitting}
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
              <DialogTitle className="text-xl font-semibold text-red-600">Delete Topic?</DialogTitle>
              <DialogDescription className="text-[#6B7280]">
                This will permanently delete <strong>{deletingTopic?.name}</strong> and all its items. This action cannot be undone.
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
