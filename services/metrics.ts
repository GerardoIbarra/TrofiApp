import * as Sentry from '@sentry/react-native';

export type MetricUnit =
  | 'none'
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'byte'
  | 'kilobyte'
  | 'megabyte'
  | 'ratio'
  | 'percent';

class MetricsService {
  /**
   * Record a custom counter metric in Sentry (increments counts, totals, activations).
   */
  public count(name: string, value: number = 1, tags?: Record<string, string | number | boolean>) {
    try {
      if ((Sentry as any).metrics?.increment) {
        (Sentry as any).metrics.increment(name, value, { tags });
      }
    } catch (_) {}

    Sentry.addBreadcrumb({
      category: 'metric.counter',
      message: `${name}: +${value}`,
      level: 'info',
      data: { name, value, tags },
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Record a custom duration / latency metric in milliseconds.
   */
  public timing(name: string, valueMs: number, tags?: Record<string, string | number | boolean>) {
    try {
      if ((Sentry as any).metrics?.distribution) {
        (Sentry as any).metrics.distribution(name, valueMs, 'millisecond', { tags });
      }
    } catch (_) {}

    try {
      Sentry.setMeasurement(name, valueMs, 'millisecond');
    } catch (_) {}

    Sentry.addBreadcrumb({
      category: 'metric.timing',
      message: `${name}: ${valueMs}ms`,
      level: 'info',
      data: { name, valueMs, tags },
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Record an arbitrary value gauge or measurement.
   */
  public measurement(
    name: string,
    value: number,
    unit: MetricUnit = 'none',
    tags?: Record<string, string | number | boolean>
  ) {
    try {
      if ((Sentry as any).metrics?.gauge) {
        (Sentry as any).metrics.gauge(name, value, { tags });
      }
    } catch (_) {}

    try {
      Sentry.setMeasurement(name, value, unit);
    } catch (_) {}

    Sentry.addBreadcrumb({
      category: 'metric.gauge',
      message: `${name}: ${value} (${unit})`,
      level: 'info',
      data: { name, value, unit, tags },
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Record unique set values (e.g., unique users per league).
   */
  public set(name: string, value: string | number, tags?: Record<string, string | number | boolean>) {
    try {
      if ((Sentry as any).metrics?.set) {
        (Sentry as any).metrics.set(name, value, { tags });
      }
    } catch (_) {}

    Sentry.addBreadcrumb({
      category: 'metric.set',
      message: `${name}: add(${value})`,
      level: 'info',
      data: { name, value, tags },
      timestamp: Date.now() / 1000,
    });
  }

  // --- High-Value Domain Specific Metrics ---

  public trackApiRequest(endpoint: string, method: string, durationMs: number, status: number) {
    this.count('api.requests', 1, { endpoint, method, status: String(status) });
    this.timing('api.response_time', durationMs, { endpoint, method, status: String(status) });
  }

  public trackMatchView(matchId: string, status: string) {
    this.count('match.views', 1, { status });
  }

  public trackRefereeRating(matchId: string, stars: number) {
    this.count('referee.ratings_submitted', 1, { stars: String(stars) });
    this.measurement('referee.rating_value', stars, 'none');
  }

  public trackRefereeOffer(action: 'sent' | 'accepted' | 'declined') {
    this.count('referee.offers', 1, { action });
  }

  public trackSponsorInteraction(action: 'impression' | 'click', type: string) {
    this.count(`sponsor.${action}`, 1, { placement_type: type });
  }

  public trackPaymentLogged(amount: number) {
    this.count('platform.payments_logged', 1);
    this.measurement('platform.payment_amount', amount, 'none');
  }

  public trackAuthEvent(event: 'login' | 'register' | 'logout', success: boolean) {
    this.count(`auth.${event}`, 1, { success: String(success) });
  }

  public trackUserRegistered(method: string = 'email') {
    this.count('user.registrations', 1, { method });
  }

  public trackRoleSelected(role: string) {
    this.count('user.role_selected', 1, { role });
  }

  public trackLeagueCreated(city?: string, country?: string) {
    this.count('leagues.created', 1, {
      city: city || 'unknown',
      country: country || 'unknown',
    });
  }

  public trackTournamentCreated(format?: string, gender?: string) {
    this.count('tournaments.created', 1, {
      format: format || 'unknown',
      gender: gender || 'unknown',
    });
  }

  public trackMatchCreated(tournamentId?: string) {
    this.count('matches.created', 1, {
      tournament: tournamentId || 'unknown',
    });
  }

  public trackScheduleGenerated(type: 'round_robin' | 'weekly', tournamentId?: string) {
    this.count('schedules.generated', 1, {
      type,
      tournament: tournamentId || 'unknown',
    });
  }

  public trackSponsorPlacementCreated(targetType: string, placementType: string) {
    this.count('sponsor.placements_created', 1, {
      target_type: targetType,
      placement_type: placementType,
    });
  }

  public trackApprovalAction(type: 'league' | 'tournament', action: 'approved' | 'rejected') {
    this.count(`admin.approvals`, 1, {
      item_type: type,
      action,
    });
  }

  public trackMatchLiveAction(
    action: 'started' | 'paused' | 'resumed' | 'ended' | 'locked',
    matchId?: string
  ) {
    this.count(`match.${action}`, 1, {
      match_id: matchId || 'unknown',
    });
  }

  public trackAttendanceConfirmation(status: string, matchId?: string) {
    this.count('attendance.responses', 1, {
      status,
      match_id: matchId || 'unknown',
    });
  }

  public trackCaptainAttendance(playerCount: number, matchId?: string) {
    this.count('attendance.captain_bulk_confirmations', 1, {
      match_id: matchId || 'unknown',
    });
    this.measurement('attendance.players_confirmed_by_captain', playerCount, 'none');
  }

  public trackRefereeAvailability(isOpen: boolean) {
    this.count('referee.availability_toggled', 1, {
      is_open: String(isOpen),
    });
  }

  public trackRefereeOfferResponse(action: 'accept' | 'decline', offerId?: string) {
    this.count('referee.offers_resolved', 1, {
      action,
      offer_id: offerId || 'unknown',
    });
  }

  public trackTeamCreated(leagueId?: string) {
    this.count('teams.created', 1, {
      league: leagueId || 'unknown',
    });
  }
}

export const metrics = new MetricsService();
export default metrics;
