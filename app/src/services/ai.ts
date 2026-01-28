import type { ItemType } from '@/types';

export interface AIGenerationResult {
  success: boolean;
  description?: string;
  properties?: { key: string; value: string }[];
  flashcardFront?: string;
  flashcardBack?: string;
  error?: string;
}

// Simulated AI generation - In production, this would call an actual AI API
export const generateItemWithAI = async (
  name: string,
  type: ItemType
): Promise<AIGenerationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // Generate content based on type and name
    const description = generateDescription(name, type);
    const properties = generateProperties(name, type);
    const flashcardFront = generateFlashcardFront(name, type);
    const flashcardBack = generateFlashcardBack(name, type);
    
    return {
      success: true,
      description,
      properties,
      flashcardFront,
      flashcardBack,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to generate content',
    };
  }
};

const generateDescription = (name: string, type: ItemType): string => {
  const descriptions: Record<ItemType, string[]> = {
    molecule: [
      `${name} is an organic compound with significant pharmacological activity. It interacts with specific biological targets to produce therapeutic effects.`,
      `${name} is a small molecule drug that modulates cellular processes through specific molecular mechanisms.`,
      `A key pharmaceutical compound, ${name} demonstrates selective binding to its target receptors.`,
    ],
    enzyme: [
      `${name} is a crucial enzyme involved in metabolic pathways. It catalyzes specific biochemical reactions essential for cellular function.`,
      `This enzyme, ${name}, plays a vital role in drug metabolism and pharmacokinetics.`,
      `${name} is a well-characterized enzyme with established kinetics and inhibition profiles.`,
    ],
    medication: [
      `${name} is a widely used therapeutic agent with proven efficacy in clinical practice.`,
      `A standard medication, ${name} is prescribed for its specific pharmacological effects.`,
      `${name} represents an important class of drugs with well-documented safety profiles.`,
    ],
  };
  
  const options = descriptions[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateProperties = (name: string, type: ItemType): { key: string; value: string }[] => {
  const baseProperties = [
    { key: 'Name', value: name },
    { key: 'Type', value: type.charAt(0).toUpperCase() + type.slice(1) },
  ];
  
  const typeSpecificProperties: Record<ItemType, { key: string; value: string }[]> = {
    molecule: [
      { key: 'Mechanism', value: 'Receptor modulation' },
      { key: 'Therapeutic Class', value: 'Pharmaceutical agent' },
      { key: 'Bioavailability', value: 'Moderate to high' },
    ],
    enzyme: [
      { key: 'EC Number', value: `EC ${Math.floor(Math.random() * 9 + 1)}.${Math.floor(Math.random() * 9 + 1)}.${Math.floor(Math.random() * 9 + 1)}.${Math.floor(Math.random() * 9 + 1)}` },
      { key: 'Cofactor', value: 'Mg²⁺ or Zn²⁺' },
      { key: 'Optimal pH', value: `${(Math.random() * 3 + 5).toFixed(1)}` },
    ],
    medication: [
      { key: 'Indication', value: 'Therapeutic use' },
      { key: 'Route', value: 'Oral / IV' },
      { key: 'Half-life', value: `${Math.floor(Math.random() * 20 + 2)} hours` },
    ],
  };
  
  return [...baseProperties, ...typeSpecificProperties[type]];
};

const generateFlashcardFront = (name: string, type: ItemType): string => {
  const fronts: Record<ItemType, string[]> = {
    molecule: [
      `What is the primary mechanism of action of ${name}?`,
      `Describe the therapeutic uses of ${name}.`,
      `What are the key pharmacokinetic properties of ${name}?`,
    ],
    enzyme: [
      `What reaction does ${name} catalyze?`,
      `Describe the role of ${name} in drug metabolism.`,
      `What are the known inhibitors of ${name}?`,
    ],
    medication: [
      `What are the primary indications for ${name}?`,
      `Describe the mechanism of action of ${name}.`,
      `What are the common side effects of ${name}?`,
    ],
  };
  
  const options = fronts[type];
  return options[Math.floor(Math.random() * options.length)];
};

const generateFlashcardBack = (name: string, type: ItemType): string => {
  const backs: Record<ItemType, string[]> = {
    molecule: [
      `${name} acts by binding to specific receptors and modulating their activity, leading to downstream therapeutic effects.`,
      `The therapeutic profile of ${name} includes its selectivity for target tissues and favorable pharmacokinetic properties.`,
      `${name} demonstrates good bioavailability and appropriate distribution characteristics for its therapeutic applications.`,
    ],
    enzyme: [
      `${name} catalyzes a critical step in metabolic pathways, with well-defined substrate specificity and kinetic parameters.`,
      `In drug metabolism, ${name} is responsible for the biotransformation of numerous pharmaceutical compounds.`,
      `Several compounds are known to inhibit ${name}, including both reversible and irreversible inhibitors.`,
    ],
    medication: [
      `${name} is indicated for conditions where its specific pharmacological effects provide therapeutic benefit.`,
      `The mechanism involves selective interaction with biological targets, producing the desired clinical outcomes.`,
      `Common side effects are generally mild and related to the drug's pharmacological action on non-target tissues.`,
    ],
  };
  
  const options = backs[type];
  return options[Math.floor(Math.random() * options.length)];
};
