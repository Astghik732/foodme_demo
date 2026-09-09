import { apiClient } from "@/api/client";
import type {
  ChefsPageDto,
  ChefTagOrderWithDishTagDto,
  DeliveryPriceRequest,
  DeliveryPriceResponse,
  DishPaginationCountDto,
  ExploreChefResponseDto,
  FullOrderDto,
  OrderCreateResponseDto,
  OrderDto,
} from "@/types";

export const foodmeApi = {
  getActiveChefs: (page = 0, size = 12) =>
    apiClient.get<ChefsPageDto>(`/api/chef/active?page=${page}&size=${size}`),

  getChefById: (id: number | string) => apiClient.get<ExploreChefResponseDto>(`/api/chef/${id}`),

  getActiveDishes: (chefId: number | string, page = 0, size = 50) =>
    apiClient.get<DishPaginationCountDto>(`/api/dish/${chefId}/active?page=${page}&size=${size}`),

  getDishTags: (chefId: number | string) =>
    apiClient.get<ChefTagOrderWithDishTagDto[]>(`/api/dish/tags?chefId=${chefId}`),

  getDeliveryPrice: (payload: DeliveryPriceRequest) =>
    apiClient.post<DeliveryPriceResponse>("/api/order/delivery-price", payload),

  createOrder: (payload: OrderDto) =>
    apiClient.post<OrderCreateResponseDto>("/api/order", payload),

  getOrderByNumber: (number: string) => apiClient.get<FullOrderDto>(`/api/order/number/${number}`),
};
