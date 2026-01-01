export type Promotion = 'B1' | 'B2' | 'B3' | 'M1' | 'M2';

export interface Student {
  id: string;
  nom: string;
  prenom: string;
  matricule?: string;
  promotion: Promotion;
  status: 'disponible' | 'parrain' | 'filleul' | 'parrain_et_filleul';
  filleulsCount?: number;
  hasParrain?: boolean;
}

export interface Pairing {
  id: string;
  parrain: Student;
  filleul: Student;
  timestamp: Date;
}

export const PAIRING_RULES: Record<Promotion, Promotion | null> = {
  'B1': null, // B1 ne parraine personne
  'B2': 'B1', // B2 parraine B1
  'B3': 'B2', // B3 parraine B2
  'M1': 'B3', // M1 parraine B3
  'M2': 'M1', // M2 parraine M1
};

export const getGodchildPromotion = (parrainPromotion: Promotion): Promotion | null => {
  return PAIRING_RULES[parrainPromotion];
};

export const getGodparentPromotion = (filleulPromotion: Promotion): Promotion | null => {
  const entry = Object.entries(PAIRING_RULES).find(([_, godchild]) => godchild === filleulPromotion);
  return entry ? entry[0] as Promotion : null;
};
