import { httpClient } from "@/lib/api/http-client";

import type { BloodType, CampaignRecord, CampaignType } from "./types";

/** hospitalId est injecté côté serveur depuis la session: inutile ici. */
export type CreateCampaignPayload = {
  title: string;
  type: CampaignType;
  targetBloodType?: BloodType;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  /** Période de la campagne (dates ISO). */
  startsAt?: string | null;
  endsAt?: string | null;
};

export const campaignsApi = {
  /** Campagnes de l'organisation connectée. */
  list: (hospitalId?: string) =>
    httpClient.get<CampaignRecord[]>("/campaigns", {
      searchParams: { hospitalId },
    }),

  create: (payload: CreateCampaignPayload) =>
    httpClient.post<CampaignRecord>("/campaigns", payload),

  /** Collectes à venir, publiées sur la vitrine. Aucune session requise. */
  publicList: () => httpClient.get<PublicCampaign[]>("/public/campaigns"),
};

/** Campagne telle qu'elle est publiée sur la vitrine. */
export type PublicCampaign = {
  id: string;
  title: string;
  organizer: string;
  city: string;
  targetBloodType: string | null;
  startsAt: string;
  endsAt: string | null;
  radiusKm: number;
  registered: number;
};
