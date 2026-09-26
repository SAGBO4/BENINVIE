import { httpClient } from "@/lib/api/http-client";

import type { BloodComponent, BloodType, StockItem } from "./types";

export type SetStockPayload = {
  component: BloodComponent;
  bloodType: BloodType;
  units: number;
  expiringSoon?: number;
};

export const stockApi = {
  /** Stock de la structure connectée. */
  list: () => httpClient.get<StockItem[]>("/stock"),
  /** Fixe le niveau d'un poste de stock de la structure connectée. */
  set: (payload: SetStockPayload) =>
    httpClient.put<StockItem>("/stock", {
      expiringSoon: 0,
      ...payload,
    }),
};
