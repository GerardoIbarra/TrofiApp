import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
      const res = await api.get<any>("/v1/notifications/");
      if (Array.isArray(res)) return res;
      return res?.results || [];
    },
  });
};

export const useGetUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      // The API endpoint is GET /api/v1/notifications/unread-count/
      const res = await api.get<{ unread_count: number }>(
        "/v1/notifications/unread-count/",
        { silent: true } // Don't show toast for background poll/fetch
      );
      return res?.unread_count || 0;
    },
    refetchInterval: 30000, // Optional: Poll every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return api.post(`/v1/notifications/${id}/read/`, {}, { silent: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return api.post(`/v1/notifications/read-all/`, {}, { silent: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
