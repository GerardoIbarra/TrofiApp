import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { VenueSchema, FieldSchema } from "../schemas/venueSchema";
import { Venue, VenuesResponse } from "../types/venue";

export const useGetVenues = (options?: { radius?: number; skipLocation?: boolean }) => {
  return useQuery({
    queryKey: ["venues", options],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (options?.radius) {
        headers["X-Radius"] = options.radius.toString();
      }
      const response = await api.get<VenuesResponse | Venue[]>("/v1/venues/", {
        headers,
        skipLocationHeaders: options?.skipLocation,
      });
      if (Array.isArray(response)) {
        return response;
      }
      return response.results || [];
    },
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VenueSchema) => {
      const response = await api.post<Venue>("/v1/venues/", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["nearby"] });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VenueSchema> }) => {
      const response = await api.patch<Venue>(`/v1/venues/${id}/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["nearby"] });
    },
  });
};

export const useGetFields = (venueId?: string) => {
  return useQuery({
    queryKey: ["fields", venueId],
    queryFn: async () => {
      const url = venueId ? `/v1/fields/?venue=${venueId}` : "/v1/fields/";
      const response = await api.get<any>(url);
      return response.results || response;
    },
    enabled: !!venueId, // Only run if we have a venueId
  });
};

export const useCreateField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FieldSchema) => {
      const response = await api.post("/v1/fields/", data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["fields", variables.venue] });
      queryClient.invalidateQueries({ queryKey: ["venues"] }); // fields might be nested in venue list sometimes
    },
  });
};
