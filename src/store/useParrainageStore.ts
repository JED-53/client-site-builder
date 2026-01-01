import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Pairing, Promotion, getGodchildPromotion } from '@/types/student';

interface ParrainageState {
  students: Student[];
  pairings: Pairing[];
  history: Pairing[][];
  
  // Actions
  addStudents: (students: Omit<Student, 'id' | 'status' | 'filleulsCount'>[]) => void;
  removeStudent: (id: string) => void;
  clearStudents: () => void;
  generatePairing: () => Pairing | null;
  createManualPairing: (parrainId: string, filleulId: string) => Pairing | null;
  undoLastPairing: () => void;
  resetAllPairings: () => void;
  getAvailableFilleuls: (promotion: Promotion) => Student[];
  getAvailableParrains: () => Student[];
  getCompatibleParrains: (filleulPromotion: Promotion) => Student[];
  getStats: () => {
    totalStudents: number;
    totalPairings: number;
    remainingFilleuls: Record<Promotion, number>;
    remainingParrains: Record<Promotion, number>;
  };
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useParrainageStore = create<ParrainageState>()(
  persist(
    (set, get) => ({
      students: [],
      pairings: [],
      history: [],

      addStudents: (newStudents) => {
        const studentsWithIds = newStudents.map((s) => ({
          ...s,
          id: generateId(),
          status: 'disponible' as const,
          filleulsCount: 0,
        }));
        set((state) => ({
          students: [...state.students, ...studentsWithIds],
        }));
      },

      removeStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
      },

      clearStudents: () => {
        set({ students: [], pairings: [], history: [] });
      },

      generatePairing: () => {
        const state = get();
        
        // Ordre de priorité des filleuls : B1, puis B2, puis B3, puis M1
        const promotionOrder: Promotion[] = ['B1', 'B2', 'B3', 'M1'];
        
        let filleul: Student | null = null;
        
        // Parcourir les promotions dans l'ordre pour trouver un filleul disponible
        for (const promo of promotionOrder) {
          const filleulsPromo = state.students.filter(
            (s) => s.status === 'disponible' && s.promotion === promo
          );
          if (filleulsPromo.length > 0) {
            // Sélectionner un filleul aléatoire dans cette promotion
            filleul = filleulsPromo[Math.floor(Math.random() * filleulsPromo.length)];
            break;
          }
        }

        if (!filleul) return null;
        
        // Trouver la promotion du parrain correspondante
        const parrainPromotion = {
          'B1': 'B2',
          'B2': 'B3',
          'B3': 'M1',
          'M1': 'M2',
        }[filleul.promotion] as Promotion;

        // Trouver les parrains disponibles (qui n'ont pas encore de filleul - relation 1-1)
        const parrainsDisponibles = state.students
          .filter((s) => s.promotion === parrainPromotion && (s.filleulsCount || 0) === 0);

        if (parrainsDisponibles.length === 0) return null;

        // Sélectionner un parrain aléatoire parmi ceux disponibles
        const parrain = parrainsDisponibles[Math.floor(Math.random() * parrainsDisponibles.length)];

        const pairing: Pairing = {
          id: generateId(),
          parrain,
          filleul,
          timestamp: new Date(),
        };

        set((state) => ({
          pairings: [...state.pairings, pairing],
          history: [...state.history, state.pairings],
          students: state.students.map((s) => {
            if (s.id === filleul.id) {
              return { ...s, status: 'filleul' as const };
            }
            if (s.id === parrain.id) {
              return {
                ...s,
                status: 'parrain' as const,
                filleulsCount: 1,
              };
            }
            return s;
          }),
        }));

        return pairing;
      },

      createManualPairing: (parrainId, filleulId) => {
        const state = get();
        
        const parrain = state.students.find((s) => s.id === parrainId);
        const filleul = state.students.find((s) => s.id === filleulId);
        
        if (!parrain || !filleul) return null;
        
        // Vérifier que le filleul est disponible
        if (filleul.status !== 'disponible') return null;
        
        // Vérifier que le parrain n'a pas déjà un filleul (relation 1-1)
        if ((parrain.filleulsCount || 0) > 0) return null;
        
        // Vérifier la compatibilité des promotions
        const expectedParrainPromo = {
          'B1': 'B2',
          'B2': 'B3',
          'B3': 'M1',
          'M1': 'M2',
        }[filleul.promotion] as Promotion;
        
        if (parrain.promotion !== expectedParrainPromo) return null;
        
        const pairing: Pairing = {
          id: generateId(),
          parrain,
          filleul,
          timestamp: new Date(),
        };

        set((state) => ({
          pairings: [...state.pairings, pairing],
          history: [...state.history, state.pairings],
          students: state.students.map((s) => {
            if (s.id === filleul.id) {
              return { ...s, status: 'filleul' as const };
            }
            if (s.id === parrain.id) {
              return {
                ...s,
                status: 'parrain' as const,
                filleulsCount: 1,
              };
            }
            return s;
          }),
        }));

        return pairing;
      },

      getCompatibleParrains: (filleulPromotion) => {
        const state = get();
        const expectedParrainPromo = {
          'B1': 'B2',
          'B2': 'B3',
          'B3': 'M1',
          'M1': 'M2',
        }[filleulPromotion] as Promotion | undefined;
        
        if (!expectedParrainPromo) return [];
        
        // Ne retourner que les parrains sans filleul (relation 1-1)
        return state.students
          .filter((s) => s.promotion === expectedParrainPromo && (s.filleulsCount || 0) === 0);
      },

      undoLastPairing: () => {
        const state = get();
        if (state.pairings.length === 0) return;

        const lastPairing = state.pairings[state.pairings.length - 1];
        const previousPairings = state.history[state.history.length - 1] || [];

        set((state) => ({
          pairings: state.pairings.slice(0, -1),
          history: state.history.slice(0, -1),
          students: state.students.map((s) => {
            if (s.id === lastPairing.filleul.id) {
              return { ...s, status: 'disponible' as const };
            }
            if (s.id === lastPairing.parrain.id) {
              const newCount = (s.filleulsCount || 1) - 1;
              return {
                ...s,
                status: newCount === 0 ? 'disponible' as const : 'parrain' as const,
                filleulsCount: newCount,
              };
            }
            return s;
          }),
        }));
      },

      resetAllPairings: () => {
        set((state) => ({
          pairings: [],
          history: [],
          students: state.students.map((s) => ({
            ...s,
            status: 'disponible' as const,
            filleulsCount: 0,
          })),
        }));
      },

      getAvailableFilleuls: (promotion) => {
        return get().students.filter(
          (s) => s.promotion === promotion && s.status === 'disponible'
        );
      },

      getAvailableParrains: () => {
        return get().students.filter(
          (s) => ['B2', 'B3', 'M1', 'M2'].includes(s.promotion)
        );
      },

      getStats: () => {
        const state = get();
        const promotions: Promotion[] = ['B1', 'B2', 'B3', 'M1', 'M2'];
        
        const remainingFilleuls = promotions.reduce((acc, promo) => {
          acc[promo] = state.students.filter(
            (s) => s.promotion === promo && s.status === 'disponible' && ['B1', 'B2', 'B3', 'M1'].includes(promo)
          ).length;
          return acc;
        }, {} as Record<Promotion, number>);

        const remainingParrains = promotions.reduce((acc, promo) => {
          acc[promo] = state.students.filter(
            (s) => s.promotion === promo && ['B2', 'B3', 'M1', 'M2'].includes(promo)
          ).length;
          return acc;
        }, {} as Record<Promotion, number>);

        return {
          totalStudents: state.students.length,
          totalPairings: state.pairings.length,
          remainingFilleuls,
          remainingParrains,
        };
      },
    }),
    {
      name: 'parrainage-storage',
    }
  )
);
