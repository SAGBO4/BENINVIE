"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  authApi,
  campaignsApi,
  contentApi,
  cardRequestsApi,
  donationsApi,
  donorsApi,
  emergenciesApi,
  organizationsApi,
  searchApi,
  statisticsApi,
  stockApi,
  transfersApi,
  verifyApi,
  type ActivityType,
  type CardOrderMethod,
  type CreateCampaignPayload,
  type CreateDonationPayload,
  type CreateDonorPayload,
  type CreateEmergencyPayload,
  type CreateTransferPayload,
  type EmergencyStatus,
  type LoginPayload,
  type OrgDocumentType,
  type RegisterOrganizationPayload,
  type SaveContentPayload,
  type RewardPayload,
  type SearchParams,
  type SetStockPayload,
  type SubmitCardRequestPayload,
  type UpdateDonorPayload,
} from "./resources";

/**
 * Toutes les vues passent par ces hooks, et tous ces hooks appellent l'API.
 * Aucun repli sur des données simulées: un écran sans backend joignable doit
 * montrer une erreur franche plutôt qu'un chiffre inventé.
 */

export const queryKeys = {
  me: ["auth", "me"] as const,
  publicStats: ["public", "stats"] as const,
  emergencies: (hospitalId?: string) =>
    ["emergencies", hospitalId ?? "all"] as const,
  emergency: (id: string) => ["emergencies", "detail", id] as const,
  campaigns: (hospitalId?: string) =>
    ["campaigns", hospitalId ?? "mine"] as const,
  publicCampaigns: ["campaigns", "public"] as const,
  donors: ["donors", "directory"] as const,
  organizations: ["organizations"] as const,
  orgDocuments: (id: string) => ["org-documents", id] as const,
  stock: ["stock"] as const,
  transfers: ["transfers"] as const,
  donations: ["donations", "history"] as const,
  donorMe: ["donor", "me"] as const,
  donorActivities: ["donor", "activities"] as const,
  donorRewards: (donorId?: string) =>
    ["donor", "rewards", donorId ?? "me"] as const,
  cardRequests: ["card-requests"] as const,
  siteContent: ["admin", "content"] as const,
  myCardRequest: ["card-request", "me"] as const,
  verify: (id: string) => ["verify", id] as const,
};

/* --------------------------- Chiffres publics ---------------------- */

/** Agrégats de la page d'accueil. Rafraîchis toutes les cinq minutes. */
export function usePublicStats() {
  return useQuery({
    queryKey: queryKeys.publicStats,
    queryFn: () => statisticsApi.publicStats().then((r) => r.data),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/* ------------------------------ Session ---------------------------- */

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authApi.me().then((r) => r.data),
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Connexion réussie." },
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useRegisterOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Compte de votre structure créé." },
    mutationFn: (payload: RegisterOrganizationPayload) =>
      authApi.register(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

/* ------------------------------ Urgences --------------------------- */

export function useEmergencies(hospitalId?: string) {
  return useQuery({
    queryKey: queryKeys.emergencies(hospitalId),
    queryFn: () => emergenciesApi.list(hospitalId).then((r) => r.data),
  });
}

export function useEmergency(id: string) {
  return useQuery({
    queryKey: queryKeys.emergency(id),
    enabled: id.length > 0,
    queryFn: () => emergenciesApi.get(id).then((r) => r.data),
  });
}

export function useCreateEmergency() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Alerte d'urgence publiée." },
    mutationFn: (payload: CreateEmergencyPayload) =>
      emergenciesApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergencies"] }),
  });
}

export function useUpdateEmergencyStatus() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Statut de l'urgence mis à jour." },
    mutationFn: ({ id, status }: { id: string; status: EmergencyStatus }) =>
      emergenciesApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergencies"] }),
  });
}

export function useDeleteEmergency() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Urgence supprimée." },
    mutationFn: (id: string) => emergenciesApi.remove(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergencies"] }),
  });
}

/* ------------------------------ Campagnes -------------------------- */

export function useCampaigns(hospitalId?: string) {
  return useQuery({
    queryKey: queryKeys.campaigns(hospitalId),
    queryFn: () => campaignsApi.list(hospitalId).then((r) => r.data),
  });
}

/** Collectes à venir affichées publiquement. */
export function usePublicCampaigns() {
  return useQuery({
    queryKey: queryKeys.publicCampaigns,
    queryFn: () => campaignsApi.publicList().then((r) => r.data),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Campagne créée." },
    mutationFn: (payload: CreateCampaignPayload) =>
      campaignsApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

/* ------------------------------ Recherche -------------------------- */

export function useSearchDonors() {
  return useMutation({
    mutationFn: (params: SearchParams) => searchApi.donors(params),
  });
}

/* ------------------------------ Donneurs --------------------------- */

/** Annuaire des donneurs validés. */
export function useDonors() {
  return useQuery({
    queryKey: queryKeys.donors,
    queryFn: () => donorsApi.list().then((r) => r.data),
  });
}

/** Fiche d'un donneur, pour les structures et l'administration. */
export function useDonor(id: string) {
  return useQuery({
    queryKey: ["donors", "detail", id],
    enabled: id.length > 0,
    queryFn: () => donorsApi.get(id).then((r) => r.data),
    retry: false,
  });
}

export function useCreateDonor() {
  return useMutation({
    meta: { success: "Donneur enregistré." },
    mutationFn: (payload: CreateDonorPayload) =>
      donorsApi.create(payload).then((r) => r.data),
  });
}

export function useValidateDonor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Donneur validé." },
    mutationFn: (id: string) => donorsApi.validate(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["donors"] }),
  });
}

export function useUpdateDonorProfile() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Profil mis à jour." },
    mutationFn: ({ id, ...payload }: { id: string } & UpdateDonorPayload) =>
      donorsApi.update(id, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["donor"] }),
  });
}

/** Ajoute une activité à un donneur (réservé aux structures connectées). */
export function useAddDonorActivity() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Activité enregistrée." },
    mutationFn: ({
      id,
      activityType,
      description,
    }: {
      id: string;
      activityType: ActivityType;
      description?: string;
    }) =>
      donorsApi
        .addActivity(id, { activityType, description })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["donor"] }),
  });
}

/* ---------------------------- Vérification ------------------------- */

export function useVerifyDonor(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.verify(id),
    queryFn: () => verifyApi.get(id).then((r) => r.data),
    enabled: enabled && id.length > 0,
    retry: false,
  });
}

export function useRewardDonor() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Récompense envoyée au donneur." },
    mutationFn: ({ id, ...payload }: { id: string } & RewardPayload) =>
      verifyApi.reward(id, payload).then((r) => r.data),
    onSuccess: () => {
      // Le solde de la structure a été débité côté serveur.
      qc.invalidateQueries({ queryKey: queryKeys.me });
      qc.invalidateQueries({ queryKey: ["donor"] });
    },
  });
}

/* ------------------------- Super-admin (orgs) ---------------------- */

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organizations,
    queryFn: () => organizationsApi.list().then((r) => r.data),
  });
}

export function useVerifyOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Organisation vérifiée." },
    mutationFn: (id: string) => organizationsApi.verify(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

export function useRejectOrganization() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Organisation rejetée." },
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      organizationsApi.reject(id, reason).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organizations"] }),
  });
}

/** Recharge le compte d'approvisionnement de la structure connectée. */
export function useRechargeOrg() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Compte d'approvisionnement rechargé." },
    mutationFn: (amountSats: number) =>
      organizationsApi.recharge(amountSats).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.me }),
  });
}

/** Justificatifs déposés par la structure connectée. */
export function useMyOrgDocuments() {
  return useQuery({
    queryKey: queryKeys.orgDocuments("me"),
    queryFn: () => organizationsApi.myDocuments().then((r) => r.data),
  });
}

/** Justificatifs d'une structure avec URLs signées (vue super-admin). */
export function useOrgDocuments(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orgDocuments(id ?? "none"),
    enabled: Boolean(id),
    queryFn: () => organizationsApi.documentsForOrg(id!).then((r) => r.data),
  });
}

export function useUploadOrgDocument() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Justificatif téléversé." },
    mutationFn: ({ docType, file }: { docType: OrgDocumentType; file: File }) =>
      organizationsApi.uploadDocument(docType, file),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.orgDocuments("me") }),
  });
}

/* ------------------------ Dons à la plateforme --------------------- */

export function useCreateDonation() {
  return useMutation({
    mutationFn: (payload: CreateDonationPayload) =>
      donationsApi.create(payload).then((r) => r.data),
  });
}

/** Historique des dons et total collecté (super-admin). */
export function useDonationsHistory() {
  return useQuery({
    queryKey: queryKeys.donations,
    queryFn: () => donationsApi.history().then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useWithdrawDonations() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Retrait des dons initié." },
    mutationFn: (bolt11: string) =>
      donationsApi.withdraw(bolt11).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["donations"] }),
  });
}

/* --------------------- Réseau inter-centres ------------------------ */

/** Stock de la structure connectée, par composant et groupe sanguin. */
export function useStock() {
  return useQuery({
    queryKey: queryKeys.stock,
    queryFn: () => stockApi.list().then((r) => r.data),
  });
}

/** Fixe le niveau d'un poste de stock de la structure connectée. */
export function useSetStock() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Stock mis à jour." },
    mutationFn: (payload: SetStockPayload) =>
      stockApi.set(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stock }),
  });
}

export function useTransfers() {
  return useQuery({
    queryKey: queryKeys.transfers,
    queryFn: () => transfersApi.list().then((r) => r.data),
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de transfert publiée." },
    mutationFn: (payload: CreateTransferPayload) =>
      transfersApi.create(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transfers }),
  });
}

export function useRespondTransfer() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Proposition envoyée au centre demandeur." },
    mutationFn: (id: string) => transfersApi.respond(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transfers }),
  });
}

/* --------------------------- Espace donneur ------------------------ */

/** Profil du donneur connecté. */
export function useDonorProfile() {
  return useQuery({
    queryKey: queryKeys.donorMe,
    queryFn: () => donorsApi.me().then((r) => r.data),
    retry: false,
  });
}

/** Historique du donneur connecté: dons, parrainages, sensibilisations. */
export function useDonorActivities() {
  return useQuery({
    queryKey: queryKeys.donorActivities,
    queryFn: () => donorsApi.myActivities().then((r) => r.data),
  });
}

/** Récompenses versées à un donneur. */
export function useDonorRewardsList(donorId?: string) {
  return useQuery({
    queryKey: queryKeys.donorRewards(donorId),
    enabled: Boolean(donorId),
    queryFn: () => donorsApi.rewards(donorId as string).then((r) => r.data),
  });
}

/**
 * Attestation d'identité sanguine signée (BIP-322), vérifiable hors-ligne.
 * La signature est produite par le serveur avec la clé de la structure: la
 * générer côté client ne prouverait rien.
 */
export function useDonorOfflineIdentity() {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      donorsApi.offlineIdentity(id).then((r) => r.data.identity),
  });
}

/**
 * Retrait du solde plateforme vers Mobile Money.
 *
 * Pas de `meta.success`: la réponse indique si un virement a réellement eu
 * lieu, et l'écran formule le message en conséquence. Un succès annoncé
 * globalement afficherait « retrait initié » par-dessus l'avertissement disant
 * que rien n'est parti.
 */
export function useWithdrawBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amountSats: number; momoNumber: string }) =>
      donorsApi.withdraw(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.donorMe }),
  });
}

/** Commande de carte physique (au mérite ou à l'achat). */
export function useOrderCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (method: CardOrderMethod) =>
      donorsApi.orderCard(method).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.donorMe }),
  });
}

/** Confirme le paiement d'une commande de carte physique. */
export function useConfirmCardOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      donorsApi.confirmCardOrder(orderId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.donorMe }),
  });
}

/* -------------------------- Cartes de donneur ---------------------- */

/** Demande de carte du donneur connecté. */
export function useMyCardRequest() {
  return useQuery({
    queryKey: queryKeys.myCardRequest,
    queryFn: () => cardRequestsApi.mine().then((r) => r.data.request),
  });
}

/** Soumet la demande de carte (photo + format). */
export function useSubmitCardRequest() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de carte envoyée." },
    mutationFn: (payload: SubmitCardRequestPayload) =>
      cardRequestsApi.submit(payload).then((r) => r.data.request),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.myCardRequest }),
  });
}

/** Liste des demandes de carte (administration). */
export function useCardRequestsList() {
  return useQuery({
    queryKey: queryKeys.cardRequests,
    queryFn: () => cardRequestsApi.list().then((r) => r.data),
  });
}

/** Valide ou refuse une demande de carte (administration). */
export function useDecideCardRequest() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Demande de carte mise à jour." },
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => cardRequestsApi.decide(id, status).then((r) => r.data.request),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cardRequests }),
  });
}

/* ------------------------ Contenus éditoriaux ---------------------- */

/** Textes des pages légales, tels qu'enregistrés (super-admin). */
export function useSiteContent() {
  return useQuery({
    queryKey: queryKeys.siteContent,
    queryFn: () => contentApi.list().then((r) => r.data),
  });
}

/** Enregistre le texte d'une page depuis la console d'administration. */
export function useSaveSiteContent() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Page enregistrée. Elle est publiée immédiatement." },
    mutationFn: (payload: SaveContentPayload) =>
      contentApi.save(payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.siteContent }),
  });
}
