import { create } from 'zustand';
import { CelebrationEvent } from '../types/celebration';

/**
 * El motor de rating puede recalcular la misma card en varios pasos y mandar
 * varios `rating_changed` seguidos. Dentro de esta ventana (contada desde el
 * último evento de esa card) los fusionamos en vez de encimar animaciones.
 */
export const RATING_DEBOUNCE_MS = 3000;

interface CelebrationState {
  /** Cola FIFO; el overlay siempre muestra `queue[0]`. */
  queue: CelebrationEvent[];
  /** Último timestamp visto por card_id, para el debounce. */
  lastRatingAt: Record<string, number>;
  /**
   * Timestamp del último evento recibido (aunque se haya deduplicado). Para
   * pantallas que no usan TanStack Query y necesitan refrescarse a mano.
   */
  lastEventAt: number;
  /** Devuelve `true` si el evento se va a animar (nuevo o fusionado). */
  enqueue: (event: CelebrationEvent) => boolean;
  dismissCurrent: () => void;
  reset: () => void;
}

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  queue: [],
  lastRatingAt: {},
  lastEventAt: 0,

  enqueue: (event) => {
    set({ lastEventAt: Date.now() });
    const { queue, lastRatingAt } = get();

    if (event.kind === 'achievement') {
      const alreadyQueued = queue.some(
        (e) => e.kind === 'achievement' && e.achievementId === event.achievementId
      );
      if (alreadyQueued) return false;
      set({ queue: [...queue, event] });
      return true;
    }

    const now = Date.now();
    const nextLastRatingAt = { ...lastRatingAt, [event.cardId]: now };
    const existingIndex = queue.findIndex(
      (e) => e.kind === 'rating' && e.cardId === event.cardId
    );

    if (existingIndex !== -1) {
      // Fusionar: conservar el "antes" original y mostrar el valor más reciente.
      const existing = queue[existingIndex] as Extract<CelebrationEvent, { kind: 'rating' }>;
      const merged = { ...existing, overall: event.overall, direction: event.direction };
      const nextQueue = [...queue];
      nextQueue[existingIndex] = merged;
      set({ queue: nextQueue, lastRatingAt: nextLastRatingAt });
      return true;
    }

    const lastSeen = lastRatingAt[event.cardId];
    if (lastSeen && now - lastSeen < RATING_DEBOUNCE_MS) {
      // Recién se animó (y se cerró) esta card: no repetir la animación.
      set({ lastRatingAt: nextLastRatingAt });
      return false;
    }

    set({ queue: [...queue, event], lastRatingAt: nextLastRatingAt });
    return true;
  },

  dismissCurrent: () => set((state) => ({ queue: state.queue.slice(1) })),

  reset: () => set({ queue: [], lastRatingAt: {}, lastEventAt: 0 }),
}));
