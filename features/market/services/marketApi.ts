import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { MarketListing, CreateMarketListingData } from "../schemas/marketSchema";

export const useGetMarketListings = (params?: { league?: string; listing_type?: string; position?: string; search?: string }) => {
  return useQuery({
    queryKey: ["market-listings", params],
    queryFn: async () => {
      // Build query string
      const searchParams = new URLSearchParams();
      if (params?.league) searchParams.append("league", params.league);
      if (params?.listing_type) searchParams.append("listing_type", params.listing_type);
      if (params?.position) searchParams.append("position", params.position);
      if (params?.search) searchParams.append("search", params.search);
      searchParams.append("is_active", "true");

      const queryStr = searchParams.toString();
      const response = await api.get<{ results: MarketListing[] }>(`/v1/market-listings/${queryStr ? `?${queryStr}` : ''}`);
      return response;
    },
  });
};

export const useCreateMarketListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMarketListingData) => {
      const response = await api.post("/v1/market-listings/", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
    },
  });
};

export const useUpdateMarketListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateMarketListingData> & { is_active?: boolean } }) => {
      const response = await api.patch(`/v1/market-listings/${id}/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
    },
  });
};

export const useDeleteMarketListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/v1/market-listings/${id}/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-listings"] });
    },
  });
};
