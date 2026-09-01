import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { VenueSchema, FieldSchema } from "../schemas/venueSchema";

export const useGetVenues = () => {
  return useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const response = await api.get<any>("/v1/venues/");
      return response.results || response;
    },
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VenueSchema) => {
      const response = await api.post("/v1/venues/", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
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
