import {
  dispatchCelebration,
  parseCelebrationEvent,
} from '../celebrationEvents';
import { useCelebrationStore, RATING_DEBOUNCE_MS } from '../../store/celebrationStore';
import { queryClient } from '@/services/queryClient';

jest.mock('@/services/queryClient', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));

const achievementData = {
  screen: 'Achievements',
  achievement_id: 'ach-1',
  achievement_type: 'loyal_fan',
};

const ratingData = (overrides: Record<string, unknown> = {}) => ({
  screen: 'PlayerCard',
  player_id: 'player-1',
  card_id: 'card-1',
  previous_overall: 70,
  overall: 74,
  direction: 'up',
  ...overrides,
});

describe('parseCelebrationEvent', () => {
  it('parses achievement_unlocked from notification_type', () => {
    const event = parseCelebrationEvent(achievementData, {
      notificationType: 'achievement_unlocked',
    });
    expect(event).toMatchObject({
      kind: 'achievement',
      achievementId: 'ach-1',
      achievementType: 'loyal_fan',
      source: 'opened',
    });
  });

  it('recognizes an achievement push by payload shape when the type is missing', () => {
    expect(parseCelebrationEvent(achievementData)?.kind).toBe('achievement');
  });

  it('ignores league achievements (nobody to animate)', () => {
    expect(
      parseCelebrationEvent(
        { ...achievementData, achievement_type: 'league_spotlight' },
        { notificationType: 'achievement_unlocked' }
      )
    ).toBeNull();
  });

  it('parses rating_changed and keeps the backend direction', () => {
    const event = parseCelebrationEvent(ratingData({ direction: 'down', overall: 68 }), {
      notificationType: 'rating_changed',
      source: 'received',
    });
    expect(event).toMatchObject({
      kind: 'rating',
      playerId: 'player-1',
      cardId: 'card-1',
      previousOverall: 70,
      overall: 68,
      direction: 'down',
      source: 'received',
    });
  });

  it('accepts stringified JSON payloads', () => {
    expect(parseCelebrationEvent(JSON.stringify(ratingData()))?.kind).toBe('rating');
  });

  it('returns null for unrelated notifications', () => {
    expect(parseCelebrationEvent({ screen: 'MatchDetail', match_id: 'm1' })).toBeNull();
    expect(
      parseCelebrationEvent(achievementData, { notificationType: 'announcement' })
    ).toBeNull();
    expect(parseCelebrationEvent(null)).toBeNull();
  });
});

describe('dispatchCelebration + store', () => {
  beforeEach(() => {
    useCelebrationStore.getState().reset();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('enqueues the event and refreshes the affected queries', () => {
    dispatchCelebration(achievementData);
    expect(useCelebrationStore.getState().queue).toHaveLength(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-achievements'],
    });
  });

  it('does not queue the same achievement twice', () => {
    dispatchCelebration(achievementData);
    dispatchCelebration(achievementData);
    expect(useCelebrationStore.getState().queue).toHaveLength(1);
  });

  it('merges repeated rating_changed for the same card, keeping the original "before"', () => {
    dispatchCelebration(ratingData({ previous_overall: 70, overall: 72 }));
    dispatchCelebration(ratingData({ previous_overall: 72, overall: 74 }));
    const { queue } = useCelebrationStore.getState();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ previousOverall: 70, overall: 74 });
  });

  it('skips re-animating a card right after it was dismissed, but animates again later', () => {
    jest.useFakeTimers();
    const store = useCelebrationStore.getState();

    dispatchCelebration(ratingData());
    store.dismissCurrent();
    dispatchCelebration(ratingData({ overall: 75 }));
    expect(useCelebrationStore.getState().queue).toHaveLength(0);
    // Aunque no se anime, igual se refrescan los datos.
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['player-cards', 'player-1'],
    });

    jest.advanceTimersByTime(RATING_DEBOUNCE_MS + 1);
    dispatchCelebration(ratingData({ overall: 76 }));
    expect(useCelebrationStore.getState().queue).toHaveLength(1);
  });
});
