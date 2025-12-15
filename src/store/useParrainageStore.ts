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
  undoLastPairing: () => void;
  resetAllPairings: () => void;
  getAvailableFilleuls: (promotion: Promotion) => Student[];
  getAvailableParrains: () => Student[];
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
        
        // Trouver les filleuls disponibles (tous les étudiants qui peuvent être parrainés)
        const filleulsDisponibles = state.students.filter(
          (s) => s.status === 'disponible' && ['B1', 'B2', 'B3', 'M1'].includes(s.promotion)
        );

        if (filleulsDisponibles.length === 0) return null;

        // Sélectionner un filleul aléatoire
        const filleul = filleulsDisponibles[Math.floor(Math.random() * filleulsDisponibles.length)];
        
        // Trouver la promotion du parrain correspondante
        const parrainPromotion = {
          'B1': 'B2',
          'B2': 'B3',
          'B3': 'M1',
          'M1': 'M2',
        }[filleul.promotion] as Promotion;

        // Trouver les parrains disponibles de cette promotion
        // Priorité à ceux qui n'ont pas encore parrainé
        const parrainsDisponibles = state.students
          .filter((s) => s.promotion === parrainPromotion)
          .sort((a, b) => (a.filleulsCount || 0) - (b.filleulsCount || 0));

        if (parrainsDisponibles.length === 0) return null;

        // Prendre le parrain avec le moins de filleuls
        const parrain = parrainsDisponibles[0];

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
                filleulsCount: (s.filleulsCount || 0) + 1,
              };
            }
            return s;
          }),
        }));

        return pairing;
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
