import {
  resolveNotificationRoute,
  handleNotificationData,
} from "../notifications";

// Mock AsyncStorage and expo-constants for notifications.ts import
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: "test-project-id",
      },
    },
  },
}));

jest.mock("@/services/queryClient", () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));

jest.mock("../api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe("Notification Navigation & Data Routing", () => {
  describe("resolveNotificationRoute", () => {
    it("resolves LeagueDetail with all free dictionary parameters preserved", () => {
      const data = {
        screen: "LeagueDetail",
        league_id: "123e4567-e89b-12d3-a456-426614174000",
        status: "approved",
      };

      const result = resolveNotificationRoute(data);
      expect(result).not.toBeNull();
      expect(result?.pathname).toBe("/league-detail");
      expect(result?.params).toEqual({
        id: "123e4567-e89b-12d3-a456-426614174000",
        league_id: "123e4567-e89b-12d3-a456-426614174000",
        status: "approved",
      });
    });

    it("resolves LeagueDetail rejection with rejection_reason in free dictionary", () => {
      const data = {
        screen: "LeagueDetail",
        league_id: "league-rejected-123",
        status: "rejected",
        rejection_reason: "Falta información de contacto.",
      };

      const result = resolveNotificationRoute(data);
      expect(result).not.toBeNull();
      expect(result?.pathname).toBe("/league-detail");
      expect(result?.params).toEqual({
        id: "league-rejected-123",
        league_id: "league-rejected-123",
        status: "rejected",
        rejection_reason: "Falta información de contacto.",
      });
    });

    it("resolves MatchDetail with match_id and extra arbitrary keys", () => {
      const data = {
        screen: "MatchDetail",
        match_id: "match-uuid-99",
        dispute_id: "dispute-1",
        reason: "score_mismatch",
      };

      const result = resolveNotificationRoute(data);
      expect(result).not.toBeNull();
      expect(result?.pathname).toBe("/match-detail");
      expect(result?.params).toEqual({
        id: "match-uuid-99",
        match_id: "match-uuid-99",
        dispute_id: "dispute-1",
        reason: "score_mismatch",
      });
    });

    it("resolves TournamentDetail with tournament_id and custom keys", () => {
      const data = {
        screen: "TournamentDetail",
        tournament_id: "tourn-456",
        phase: "playoffs",
      };

      const result = resolveNotificationRoute(data);
      expect(result?.pathname).toBe("/tournament-detail");
      expect(result?.params).toEqual({
        id: "tourn-456",
        tournament_id: "tourn-456",
        phase: "playoffs",
      });
    });

    it("resolves TeamDetail with team_id and invitation tokens", () => {
      const data = {
        screen: "TeamDetail",
        team_id: "team-789",
        invitation_id: "inv-001",
      };

      const result = resolveNotificationRoute(data);
      expect(result?.pathname).toBe("/team-detail");
      expect(result?.params).toEqual({
        id: "team-789",
        team_id: "team-789",
        invitation_id: "inv-001",
      });
    });

    it("resolves DirectMessages with conversation and sender params", () => {
      const data = {
        screen: "DirectMessages",
        with_user_id: "usr-321",
        user_name: "Gerardo",
      };

      const result = resolveNotificationRoute(data);
      expect(result?.pathname).toBe("/direct-messages");
      expect(result?.params.with).toBe("usr-321");
      expect(result?.params.name).toBe("Gerardo");
    });

    it("handles stringified JSON data payloads gracefully", () => {
      const rawString = JSON.stringify({
        screen: "LeagueDetail",
        league_id: "league-string-json",
        status: "approved",
      });

      const result = resolveNotificationRoute(rawString);
      expect(result?.pathname).toBe("/league-detail");
      expect(result?.params.id).toBe("league-string-json");
      expect(result?.params.status).toBe("approved");
    });

    it("supports fallback inference when screen is missing but IDs exist", () => {
      const data = {
        match_id: "inferred-match-1",
      };

      const result = resolveNotificationRoute(data);
      expect(result?.pathname).toBe("/match-detail");
      expect(result?.params.id).toBe("inferred-match-1");
    });

    it("returns null when data is null, undefined, or invalid", () => {
      expect(resolveNotificationRoute(null)).toBeNull();
      expect(resolveNotificationRoute(undefined)).toBeNull();
      expect(resolveNotificationRoute("invalid-json{")).toBeNull();
    });
  });

  describe("handleNotificationData", () => {
    it("calls the navigate callback with resolved pathname and all params", () => {
      const navigateMock = jest.fn();
      const data = {
        screen: "LeagueDetail",
        league_id: "uuid-123",
        status: "approved",
      };

      handleNotificationData(data, navigateMock);

      expect(navigateMock).toHaveBeenCalledTimes(1);
      expect(navigateMock).toHaveBeenCalledWith("/league-detail", {
        id: "uuid-123",
        league_id: "uuid-123",
        status: "approved",
      });
    });
  });
  describe("celebration events routing", () => {
    it("routes achievement_unlocked to the profile with the achievements modal open", () => {
      const result = resolveNotificationRoute({
        screen: "Achievements",
        achievement_id: "ach-1",
        achievement_type: "loyal_fan",
      });
      expect(result?.pathname).toBe("/profile");
      expect(result?.params.openAchievements).toBe("1");
    });

    it("routes rating_changed to the user's own profile (card)", () => {
      const result = resolveNotificationRoute({
        screen: "PlayerCard",
        player_id: "player-1",
        card_id: "card-1",
        previous_overall: 70,
        overall: 74,
        direction: "up",
      });
      expect(result?.pathname).toBe("/profile");
    });
  });
});
