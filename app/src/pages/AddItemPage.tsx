import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Beaker, 
  Pill, 
  Zap, 
  Sparkles, 
  Database, 
  Plus, 
  X,
  Loader2,
  Check,
  Upload
} from 'lucide-react';
import type { Chapter, StudyItem, ItemType, Property } from '@/types';
import { generateItemWithAI } from '@/services/ai';
import { searchPubChem, convertPubChemToProperties } from '@/services/pubchem';
import { itemsApi } from '@/services/api';
import { toast } from 'sonner';

interface AddItemPageProps {
  chapters: Chapter[];
  chapterId: string;
  topicId: string;
  editingItem?: StudyItem | null;
  onAddItem: (chapterId: string, topicId: string, itemData: any) => void;
  onUpdateItem?: (itemId: string, updates: any) => void;
  onCancel: () => void;
}

export const AddItemPage = ({ 
  chapters, 
  chapterId,
  topicId,
  editingItem,
  onAddItem, 
  onUpdateItem,
  onCancel 
}: AddItemPageProps) => {
  const isEditing = !!editingItem;
  
  const [itemType, setItemType] = useState<ItemType>(editingItem?.type || 'molecule');
  const [name, setName] = useState(editingItem?.name || '');
  const [scientificName, setScientificName] = useState(editingItem?.scientificName || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [properties, setProperties] = useState<Property[]>(editingItem?.properties || []);
  const [flashcardFront, setFlashcardFront] = useState(editingItem?.flashcardFront || '');
  const [flashcardBack, setFlashcardBack] = useState(editingItem?.flashcardBack || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingPubChem, setIsSearchingPubChem] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [pubChemQuery, setPubChemQuery] = useState('');
  const [imageUrl, setImageUrl] = useState<string>(editingItem?.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chapter = chapters.find(ch => ch.id === chapterId);
  const topic = chapter?.topics.find(tp => tp.id === topicId);

  const handleAddProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handlePropertyChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...properties];
    updated[index][field] = value;
    setProperties(updated);
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setIsGenerating(true);
    const result = await generateItemWithAI(aiPrompt, itemType);
    setIsGenerating(false);
    
    if (result.success && result.description) {
      setName(aiPrompt);
      setDescription(result.description);
      if (result.properties) setProperties(result.properties);
      if (result.flashcardFront) setFlashcardFront(result.flashcardFront);
      if (result.flashcardBack) setFlashcardBack(result.flashcardBack);
      setActiveTab('manual');
      toast.success('Content generated successfully!');
    } else {
      toast.error(result.error || 'Failed to generate content');
    }
  };

  const handleSearchPubChem = async () => {
    if (!pubChemQuery.trim()) {
      toast.error('Please enter a compound name');
      return;
    }
    
    setIsSearchingPubChem(true);
    const result = await searchPubChem(pubChemQuery);
    setIsSearchingPubChem(false);
    
    if (result.success && result.compound) {
      setName(result.compound.name);
      setScientificName(result.compound.iupacName || '');
      setDescription(result.compound.description || `Molecular formula: ${result.compound.molecularFormula}`);
      setProperties(convertPubChemToProperties(result.compound));
      setActiveTab('manual');
      toast.success('Compound data imported from PubChem!');
    } else {
      toast.error(result.error || 'Compound not found');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const { imageUrl: url } = await itemsApi.uploadImage(file);
      setImageUrl(url);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    }
    setIsUploading(false);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsSubmitting(true);
    
    const itemData = {
      name: name.trim(),
      scientificName: scientificName.trim() || undefined,
      type: itemType,
      description: description.trim() || 'No description provided.',
      imageUrl: imageUrl || undefined,
      properties: properties.filter(p => p.key && p.value),
      flashcardFront: flashcardFront.trim() || undefined,
      flashcardBack: flashcardBack.trim() || undefined,
    };

    try {
      if (isEditing && onUpdateItem) {
        await onUpdateItem(editingItem.id, itemData);
        toast.success('Item updated successfully!');
      } else {
        await onAddItem(chapterId, topicId, itemData);
        toast.success('Item added successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    }
    
    setIsSubmitting(false);
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case 'molecule': return <Beaker className="w-5 h-5" />;
      case 'enzyme': return <Zap className="w-5 h-5" />;
      case 'medication': return <Pill className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#0B1E5B] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {topic?.name || 'Topic'}
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0B1E5B]">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </h1>
          <p className="text-[#6B7280] mt-2">
            {isEditing ? 'Update item details' : 'Add molecules, enzymes, or medications to your study materials'}
          </p>
        </div>

        {/* Location Info */}
        <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#0B1E5B] mb-4">Location</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[#6B7280]">Chapter:</span>
            <span className="font-medium text-[#0B1E5B]">{chapter?.name}</span>
            <span className="text-[#6B7280]">/</span>
            <span className="text-[#6B7280]">Topic:</span>
            <span className="font-medium text-[#0B1E5B]">{topic?.name}</span>
          </div>
        </div>

        {/* Input Method Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 bg-white p-1 rounded-full border-2 border-[#0B1E5B]/20 h-auto">
            <TabsTrigger value="manual" className="rounded-full py-3 data-[state=active]:bg-[#00B8A9] data-[state=active]:text-white">
              Manual
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-full py-3 data-[state=active]:bg-[#00B8A9] data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assist
            </TabsTrigger>
            <TabsTrigger value="pubchem" className="rounded-full py-3 data-[state=active]:bg-[#00B8A9] data-[state=active]:text-white">
              <Database className="w-4 h-4 mr-2" />
              PubChem
            </TabsTrigger>
          </TabsList>

          {/* Manual Tab */}
          <TabsContent value="manual" className="space-y-6">
            <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6">
              <h2 className="text-lg font-semibold text-[#0B1E5B] mb-4">Item Details</h2>
              
              {/* Type Selection */}
              <div className="mb-6">
                <Label className="text-[#0B1E5B] font-medium mb-3 block">Item Type</Label>
                <div className="flex flex-wrap gap-3">
                  {(['molecule', 'enzyme', 'medication'] as ItemType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setItemType(type)}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-200 capitalize
                        ${itemType === type
                          ? 'bg-[#00B8A9] text-white border-[#00B8A9]'
                          : 'bg-white text-[#0B1E5B] border-[#0B1E5B]/20 hover:border-[#00B8A9]'
                        }
                      `}
                    >
                      {getItemIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-[#0B1E5B] font-medium mb-2 block">Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aspirin"
                    className="h-12 rounded-xl border-2 border-[#0B1E5B]/20 focus:border-[#00B8A9]"
                  />
                </div>
                <div>
                  <Label className="text-[#0B1E5B] font-medium mb-2 block">Scientific Name (optional)</Label>
                  <Input
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    placeholder="e.g., Acetylsalicylic Acid"
                    className="h-12 rounded-xl border-2 border-[#0B1E5B]/20 focus:border-[#00B8A9]"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <Label className="text-[#0B1E5B] font-medium mb-2 block">Image</Label>
                {imageUrl ? (
                  <div className="relative inline-block">
                    <img src={imageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-xl border-2 border-[#0B1E5B]/20" />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-[#0B1E5B]/30 rounded-xl cursor-pointer hover:border-[#00B8A9] hover:bg-[#00B8A9]/5 transition-all">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {isUploading ? <Loader2 className="w-6 h-6 text-[#00B8A9] animate-spin" /> : <>
                      <Upload className="w-6 h-6 text-[#6B7280] mb-1" />
                      <span className="text-xs text-[#6B7280]">Upload</span>
                    </>}
                  </label>
                )}
                <p className="text-xs text-[#6B7280] mt-2">Max size: 5MB. Cloud storage via Cloudinary.</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <Label className="text-[#0B1E5B] font-medium mb-2 block">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this item..."
                  className="min-h-[100px] rounded-xl border-2 border-[#0B1E5B]/20 focus:border-[#00B8A9] resize-none"
                />
              </div>

              {/* Properties */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[#0B1E5B] font-medium">Properties</Label>
                  <button onClick={handleAddProperty} className="flex items-center gap-1 text-[#00B8A9] text-sm font-medium hover:underline">
                    <Plus className="w-4 h-4" /> Add Property
                  </button>
                </div>
                <div className="space-y-3">
                  {properties.map((prop, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        value={prop.key}
                        onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                        placeholder="Key (e.g., Molecular Formula)"
                        className="flex-1 h-11 rounded-xl border-2 border-[#0B1E5B]/20"
                      />
                      <Input
                        value={prop.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 h-11 rounded-xl border-2 border-[#0B1E5B]/20"
                      />
                      <button onClick={() => handleRemoveProperty(index)} className="p-2 hover:bg-red-50 rounded-xl">
                        <X className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flashcard Fields */}
              <div className="border-t border-[#0B1E5B]/10 pt-6">
                <h3 className="text-md font-semibold text-[#0B1E5B] mb-4">Flashcard (Optional)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#0B1E5B] font-medium mb-2 block">Front (Question)</Label>
                    <Textarea
                      value={flashcardFront}
                      onChange={(e) => setFlashcardFront(e.target.value)}
                      placeholder="Question for flashcard..."
                      className="min-h-[80px] rounded-xl border-2 border-[#0B1E5B]/20 resize-none"
                    />
                  </div>
                  <div>
                    <Label className="text-[#0B1E5B] font-medium mb-2 block">Back (Answer)</Label>
                    <Textarea
                      value={flashcardBack}
                      onChange={(e) => setFlashcardBack(e.target.value)}
                      placeholder="Answer for flashcard..."
                      className="min-h-[80px] rounded-xl border-2 border-[#0B1E5B]/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={onCancel} className="flex-1 h-14 rounded-full" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || isSubmitting}
                className="flex-1 h-14 bg-[#00B8A9] hover:bg-[#00a396] text-white rounded-full font-semibold"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                  <Check className="w-5 h-5 mr-2" />
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </>}
              </Button>
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1E5B]">AI-Powered Generation</h2>
                  <p className="text-sm text-[#6B7280]">Describe what you want to add, and AI will generate the details</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-[#0B1E5B] font-medium mb-2 block">Description</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`Describe the ${itemType} you want to add...`}
                  className="min-h-[150px] rounded-xl border-2 border-[#0B1E5B]/20 resize-none"
                />
              </div>

              <Button
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold"
              >
                {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate with AI</>}
              </Button>
            </div>
          </TabsContent>

          {/* PubChem Tab */}
          <TabsContent value="pubchem" className="space-y-6">
            <div className="bg-white rounded-[22px] border-2 border-[#0B1E5B] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#0B1E5B]">Import from PubChem</h2>
                  <p className="text-sm text-[#6B7280]">Search the PubChem database for molecular data</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-[#0B1E5B] font-medium mb-2 block">Compound Name</Label>
                <div className="flex gap-3">
                  <Input
                    value={pubChemQuery}
                    onChange={(e) => setPubChemQuery(e.target.value)}
                    placeholder="e.g., Aspirin, Caffeine..."
                    className="flex-1 h-12 rounded-xl border-2 border-[#0B1E5B]/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPubChem()}
                  />
                  <Button
                    onClick={handleSearchPubChem}
                    disabled={isSearchingPubChem || !pubChemQuery.trim()}
                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  >
                    {isSearchingPubChem ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Database className="w-5 h-5 mr-2" /> Search</>}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {['Aspirin', 'Caffeine', 'Ibuprofen', 'Paracetamol'].map(compound => (
                    <button key={compound} onClick={() => setPubChemQuery(compound)} className="px-3 py-1 bg-white rounded-full border border-blue-200 hover:border-blue-400">
                      {compound}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
