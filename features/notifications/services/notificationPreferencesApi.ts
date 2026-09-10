import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import {
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "../types/notificationPreferences";

export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async (): Promise<NotificationPreferences> => {
      const response = await api.get<any>("/v1/notification-preferences/");
      
      let item: NotificationPreferences | null = null;
      if (Array.isArray(response)) {
        item = response.length > 0 ? response[0] : null;
      } else if (response?.results && Array.isArray(response.results)) {
        item = response.results.length > 0 ? response.results[0] : null;
      } else if (response && typeof response === "object" && !response.detail) {
        item = response as NotificationPreferences;
      }

      if (!item) {
        return DEFAULT_NOTIFICATION_PREFERENCES;
      }

      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...item,
      };
    },
  });
};

export const useSaveNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<NotificationPreferences> & { id?: string }
    ): Promise<NotificationPreferences> => {
      const { id, user, created_at, updated_at, ...payload } = data;

      if (id) {
        // Update existing row
        return await api.patch<NotificationPreferences>(
          `/v1/notification-preferences/${id}/`,
          payload
        );
      } else {
        // Create new row
        try {
          return await api.post<NotificationPreferences>(
            "/v1/notification-preferences/",
            payload
          );
        } catch (error: any) {
          // If already exists (400), fetch the ID and retry via PATCH
          const existing = await api.get<any>("/v1/notification-preferences/");
          let existingItem = Array.isArray(existing)
            ? existing[0]
            : existing?.results?.[0] || existing;
          if (existingItem?.id) {
            return await api.patch<NotificationPreferences>(
              `/v1/notification-preferences/${existingItem.id}/`,
              payload
            );
          }
          throw error;
        }
      }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(["notification-preferences"], saved);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
};
