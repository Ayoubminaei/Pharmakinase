import type { PubChemCompound, Property } from '@/types';

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

export interface PubChemSearchResult {
  success: boolean;
  compound?: PubChemCompound;
  error?: string;
}

export const searchPubChem = async (query: string): Promise<PubChemSearchResult> => {
  try {
    // First, search for the compound by name
    const searchUrl = `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(query)}/cids/JSON`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      return { success: false, error: 'Compound not found' };
    }
    
    const searchData = await searchResponse.json();
    const cid = searchData.IdentifierList?.CID?.[0];
    
    if (!cid) {
      return { success: false, error: 'No compound found with that name' };
    }
    
    // Get compound properties
    const propertiesUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`;
    const propertiesResponse = await fetch(propertiesUrl);
    
    if (!propertiesResponse.ok) {
      return { success: false, error: 'Failed to fetch compound properties' };
    }
    
    const propertiesData = await propertiesResponse.json();
    const prop = propertiesData.PropertyTable?.Properties?.[0];
    
    if (!prop) {
      return { success: false, error: 'No properties found' };
    }
    
    // Get synonyms
    const synonymsUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/synonyms/JSON`;
    const synonymsResponse = await fetch(synonymsUrl);
    let synonyms: string[] = [];
    
    if (synonymsResponse.ok) {
      const synonymsData = await synonymsResponse.json();
      synonyms = synonymsData.InformationList?.Information?.[0]?.Synonym?.slice(0, 5) || [];
    }
    
    // Get description
    const descriptionUrl = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/description/JSON`;
    const descriptionResponse = await fetch(descriptionUrl);
    let description = '';
    
    if (descriptionResponse.ok) {
      const descriptionData = await descriptionResponse.json();
      description = descriptionData.InformationList?.Information?.[0]?.Description || '';
    }
    
    const compound: PubChemCompound = {
      cid: prop.CID,
      name: query,
      molecularFormula: prop.MolecularFormula,
      molecularWeight: prop.MolecularWeight,
      iupacName: prop.IUPACName,
      synonyms: synonyms,
      description: description,
    };
    
    return { success: true, compound };
  } catch (error) {
    return { success: false, error: 'Network error occurred' };
  }
};

export const convertPubChemToProperties = (compound: PubChemCompound): Property[] => {
  const properties: Property[] = [
    { key: 'Molecular Formula', value: compound.molecularFormula },
    { key: 'Molar Mass', value: `${compound.molecularWeight} g/mol` },
    { key: 'CID', value: compound.cid.toString() },
  ];
  
  if (compound.iupacName) {
    properties.push({ key: 'IUPAC Name', value: compound.iupacName });
  }
  
  if (compound.synonyms && compound.synonyms.length > 0) {
    properties.push({ key: 'Synonyms', value: compound.synonyms.join(', ') });
  }
  
  return properties;
};

export const getPubChemImageUrl = (cid: number): string => {
  return `${PUBCHEM_BASE_URL}/compound/cid/${cid}/PNG`;
};
