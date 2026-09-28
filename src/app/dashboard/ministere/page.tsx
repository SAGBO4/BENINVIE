"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Activity,
  AlertTriangle,
  Heart,
  ShieldAlert,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Layers,
  Map as MapIcon,
  Table as TableIcon,
  ShieldCheck,
  Landmark,
  TrendingUp,
  Lock,
  ChevronRight,
  ExternalLink,
  Shield,
  FileCheck2,
  Ban,
  UserCheck,
  Stethoscope,
  Pill,
  Printer,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { OpenStreetMapTerritoire } from "@/components/map/OpenStreetMapTerritoire";
import { POLES_DEVELOPPEMENT_BENIN } from "@/data/communes";
import Link from "next/link";

interface DepartementSanitaireStat {
  nom: string;
  chefLieu: string;
  etablissements: number;
  litsDisponibles: number;
  stocksSang: number;
  tauxCouvertureArch: string;
  conformiteArs: string;
  urgencesVitalesActives: number;
}

const DEPARTEMENTS_STATS: DepartementSanitaireStat[] = [
  { nom: "Littoral", chefLieu: "Cotonou", etablissements: 142, litsDisponibles: 1250, stocksSang: 480, tauxCouvertureArch: "96.4%", conformiteArs: "99.8%", urgencesVitalesActives: 12 },
  { nom: "Atlantique", chefLieu: "Allada", etablissements: 98, litsDisponibles: 840, stocksSang: 310, tauxCouvertureArch: "94.2%", conformiteArs: "99.1%", urgencesVitalesActives: 8 },
  { nom: "Ouémé", chefLieu: "Porto-Novo", etablissements: 76, litsDisponibles: 620, stocksSang: 220, tauxCouvertureArch: "92.8%", conformiteArs: "98.9%", urgencesVitalesActives: 5 },
  { nom: "Borgou", chefLieu: "Parakou", etablissements: 88, litsDisponibles: 710, stocksSang: 290, tauxCouvertureArch: "91.5%", conformiteArs: "99.0%", urgencesVitalesActives: 7 },
  { nom: "Alibori", chefLieu: "Kandi", etablissements: 45, litsDisponibles: 380, stocksSang: 140, tauxCouvertureArch: "89.2%", conformiteArs: "98.2%", urgencesVitalesActives: 4 },
  { nom: "Atacora", chefLieu: "Natitingou", etablissements: 52, litsDisponibles: 420, stocksSang: 160, tauxCouvertureArch: "88.7%", conformiteArs: "98.5%", urgencesVitalesActives: 3 },
  { nom: "Donga", chefLieu: "Djougou", etablissements: 38, litsDisponibles: 310, stocksSang: 110, tauxCouvertureArch: "90.1%", conformiteArs: "98.7%", urgencesVitalesActives: 3 },
  { nom: "Zou", chefLieu: "Abomey", etablissements: 64, litsDisponibles: 520, stocksSang: 190, tauxCouvertureArch: "93.4%", conformiteArs: "98.8%", urgencesVitalesActives: 4 },
  { nom: "Collines", chefLieu: "Dassa-Zoumè", etablissements: 48, litsDisponibles: 390, stocksSang: 130, tauxCouvertureArch: "89.9%", conformiteArs: "98.4%", urgencesVitalesActives: 3 },
  { nom: "Mono", chefLieu: "Lokossa", etablissements: 36, litsDisponibles: 280, stocksSang: 95, tauxCouvertureArch: "91.0%", conformiteArs: "99.2%", urgencesVitalesActives: 2 },
  { nom: "Couffo", chefLieu: "Aplahoué", etablissements: 32, litsDisponibles: 240, stocksSang: 85, tauxCouvertureArch: "87.8%", conformiteArs: "98.1%", urgencesVitalesActives: 2 },
  { nom: "Plateau", chefLieu: "Pobè", etablissements: 34, litsDisponibles: 260, stocksSang: 90, tauxCouvertureArch: "90.5%", conformiteArs: "98.6%", urgencesVitalesActives: 2 },
];

export default function MinistereDashboardPage(): ReactNode {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("Borgou");
  const [deptSearch, setDeptSearch] = useState("");
  const [selectedPole, setSelectedPole] = useState<string>("ALL");
  const [vueMode, setVueMode] = useState<"map" | "table">("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [inspectionMsg, setInspectionMsg] = useState<string | null>(null);
  const [showMandatModal, setShowMandatModal] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [stocksRes, carteRes, auditRes, sigRes] = await Promise.all([
          fetch("/api/v1/hemora/stocks"),
          fetch("/api/v1/carte-sanitaire"),
          fetch("/api/v1/audit-logs"),
          fetch("/api/v1/signalements"),
        ]);

        const stocksJson = await stocksRes.json();
        const carteJson = await carteRes.json();
        const auditJson = await auditRes.json();
        const sigJson = await sigRes.json();

        if (stocksJson.success) setStocks(stocksJson.stocks || []);
        if (carteJson.success) setFacilities(carteJson.etablissements || []);
        if (auditJson.success) setAuditLogs(auditJson.data || []);
        if (sigJson.success) setSignalements(sigJson.signalements || []);
      } catch (e) {
        console.error("Erreur chargement ministère:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTriggerInspection = (
    etablissementCible = "Hôpital de Zone de Nikki",
    motif = "Contrôle inopiné gratuité des urgences vitales (0 FCFA) et conformité tiers-payant ARCH"
  ) => {
    const mandatId = `MANDAT-IGS-${Date.now().toString().slice(-4)}`;
    setInspectionMsg(`Arrêté ministériel #${mandatId} émis pour ${etablissementCible} avec réquisition des registres APDP.`);
    setShowMandatModal({
      id: mandatId,
      etablissement: etablissementCible,
      date: new Date().toLocaleDateString("fr-BJ", { day: "2-digit", month: "long", year: "numeric" }),
      ministre: `${user?.prenom || "Prof. Benjamin"} ${user?.nom || "HOUNKPATIN"}`,
      motif,
    });
  };

  const filteredFacilities = facilities.filter((f) => {
    const matchDept = selectedDept === "ALL" || f.departement === selectedDept;
    const matchPole =
      selectedPole === "ALL" ||
      f.poleId === selectedPole ||
      POLES_DEVELOPPEMENT_BENIN.find((p) => p.id === selectedPole)?.communes.some(
        (c) => c.toLowerCase() === (f.commune || "").toLowerCase()
      );
    const matchSearch =
      searchTerm === "" ||
      f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.commune.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDept && matchPole && matchSearch;
  });

  const filteredDepartements = DEPARTEMENTS_STATS.filter(
    (d) =>
      d.nom.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.chefLieu.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const selectedDeptData = DEPARTEMENTS_STATS.find((d) => d.nom === selectedDept) || DEPARTEMENTS_STATS[0];
  const criticalStocks = stocks.filter((s) => s.quantitePoches <= s.seuilAlerte);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <main className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* BANNIÈRE RÉGALIENNE : MINISTÈRE DE LA SANTÉ */}
        <Card className="border-blue-900/20 shadow-xl bg-white">
          <CardHeader className="p-5 sm:p-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0a3764]/10 border border-[#0a3764]/20 flex items-center justify-center shrink-0 text-[#0a3764]">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      Ministère de la Santé &bull; Direction Générale des Établissements de Soins
                    </CardTitle>
                    <Badge variant="default" className="text-[10px] uppercase font-bold px-2.5 bg-[#0a3764]">
                      Supervision Nationale Régalienne
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
                    République du Bénin &bull; Veille Épidémiologique, Urgences Vitales (0 FCFA) &bull; Régulation Transfusionnelle CNTS
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Session Ministérielle Active</span>
                  <strong className="text-slate-900">{user?.prenom} {user?.nom}</strong>
                  <span className="text-slate-500 block text-[10px]">{user?.titre}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* NOTIFICATION D'ACTION RÉGALIENNE */}
        {inspectionMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{inspectionMsg}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setInspectionMsg(null)} className="h-7 text-xs">
              Fermer
            </Button>
          </div>
        )}

        {/* MACRO-INDICATEURS NATIONAUX (SHADCN CARDS) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0a3764]" />
              <span>Indicateurs de Pilotage Sanitaire National</span>
            </h2>
            <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
              06 Pôles Territoriaux &bull; 77 Communes Interconnectées
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-5 space-y-2 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Plateaux Techniques Homologués</span>
                <Building2 className="w-4 h-4 text-[#0a3764]" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {facilities.length || "77+"}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> CHIC, CNHU, CHD & 600 Centres
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Stocks Nationaux de Sang (CGR)</span>
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {stocks.reduce((acc, s) => acc + (s.quantitePoches || 0), 0) || 2200}
              </div>
              <p className="text-[10px] text-slate-500">
                Poches réparties dans les 12 dépôts CNTS
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Alertes Ruptures Transfusionnelles</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono">
                {criticalStocks.length}
              </div>
              <p className="text-[10px] text-amber-700 font-medium">
                Dépôts sous le seuil d&apos;alerte minimale
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Garantie Urgences Vitales (0 FCFA)</span>
                <Stethoscope className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                100%
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                Admission immédiate sans caution préalable
              </p>
            </Card>

            <Card className="p-5 space-y-2 border-red-200 bg-red-50/50 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-800 font-medium">Signalements Usagers Déposés</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-black text-red-700 font-mono">
                {signalements.length}
              </div>
              <p className="text-[10px] text-red-800">
                Inspection Générale de la Santé saisie
              </p>
            </Card>
          </div>
        </section>

        {/* SECTION SUPERVISION & TUTELLE DES ORGANES DE RÉGULATION */}
        <Card className="border-slate-200 bg-white shadow-md">
          <CardHeader className="p-5 sm:p-6 pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0a3764]/10 border border-[#0a3764]/20 flex items-center justify-center text-[#0a3764] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                      Tutelle &amp; Contrôle des Organes Régulateurs (ARS &bull; APDP &bull; CNTS)
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      Coordination Inter-Agences
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Le Ministère coordonne le contrôle des habilitations soignantes, l&apos;audit des accès médicaux et la régulation MTA.
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  onClick={() => handleTriggerInspection()}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold h-8 cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Déclencher Audit Inopiné IGS</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs font-bold h-8 cursor-pointer"
                >
                  <Link href="/dashboard/ars" className="flex items-center gap-1">
                    <span>Console ARS</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs font-bold h-8 cursor-pointer"
                >
                  <Link href="/dashboard/apdp" className="flex items-center gap-1">
                    <span>Audit APDP</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Autorité de Régulation (ARS)</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">Actif</Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">Mme Carole KPOTIN</div>
                <div className="font-mono text-[11px] text-[#0a3764]">NPI-ARS-2026-002</div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
                  Homologation officielle de 28 spécialités MTA et contrôle de 600 centres de santé.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Protection des Données (APDP)</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">Journal Scellé</Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">M. Séraphin TOSSOU</div>
                <div className="font-mono text-[11px] text-[#0a3764]">NPI-APDP-2026-003</div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
                  Surveillance inaltérable des accès &quot;Bris de Glace&quot; et conformité Loi 2017-20.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Programme Transfusionnel (CNTS)</span>
                  <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300">Régulation 24/7</Badge>
                </div>
                <div className="text-sm font-bold text-slate-900">Banque Nationale du Sang</div>
                <div className="font-mono text-[11px] text-[#0a3764]">CNTS-COTONOU-HZ-NIKKI</div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
                  Régulation dynamique par algorithme géodésique (rayon 45 km) et dédommagement donneur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PANORAMA DES 12 DÉPARTEMENTS DU BÉNIN (TABLE SHADCN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <Card className="lg:col-span-8 border-slate-200 shadow-md bg-white">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Tableau National des 12 Départements &bull; Couverture Sanitaire & Urgences
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Suivi consolidé des formations sanitaires, capacités d&apos;accueil, stocks de sang et conformité ordinale.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-36 sm:w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Filtrer département..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="h-8 pl-8 text-xs bg-slate-50 border-slate-300"
                    />
                  </div>
                  <Badge variant="default" className="text-[10px] shrink-0 bg-[#0a3764]">
                    12 Départements
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Département</TableHead>
                      <TableHead>Chef-Lieu</TableHead>
                      <TableHead className="text-center">Établissements</TableHead>
                      <TableHead className="text-center">Lits Disponibles</TableHead>
                      <TableHead className="text-center">Stocks Sang</TableHead>
                      <TableHead className="text-center">Couverture ARCH</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartements.map((dep) => (
                      <TableRow
                        key={dep.nom}
                        className={`cursor-pointer transition-colors ${
                          selectedDept === dep.nom ? "bg-blue-50/70" : "hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedDept(dep.nom)}
                      >
                        <TableCell className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0a3764]" />
                          <span>{dep.nom}</span>
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {dep.chefLieu}
                        </TableCell>
                        <TableCell className="text-center font-mono text-slate-900">
                          {dep.etablissements}
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-slate-900">
                          {dep.litsDisponibles}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            {dep.stocksSang} poches
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-emerald-700">
                          {dep.tauxCouvertureArch}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-slate-600">
                  Département sélectionné : <strong className="text-slate-900">{selectedDeptData.nom}</strong> ({selectedDeptData.chefLieu}) &bull;{" "}
                  <span className="font-mono text-[#0a3764] font-bold">{selectedDeptData.etablissements}</span> structures de soins
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Conformité plateaux techniques : {selectedDeptData.conformiteArs}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* TÉLÉMÉTRIE HEMORA ET RUPTURES CRITIQUES (5 colonnes) */}
          <Card className="lg:col-span-4 border-slate-200 shadow-md bg-white">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span>Régulation CNTS &amp; Alertes Transfusionnelles</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Surveillance continue des réserves départementales et réquisition automatique de donneurs.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3">
              {criticalStocks.length > 0 ? (
                criticalStocks.map((stock, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs border border-amber-300">
                        {stock.groupe}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{stock.hopitalNom}</p>
                        <p className="text-[10px] text-slate-500">{stock.commune} ({stock.departement})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-800">{stock.quantitePoches} poches</span>
                      <span className="block text-[10px] text-slate-500">Seuil min : {stock.seuilAlerte}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <span>Aucune alerte de rupture critique signalée. Stocks nationaux au-dessus du seuil réglementaire.</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="w-full text-xs font-bold h-8"
                >
                  <Link href="/dashboard/citoyen" className="flex items-center justify-center gap-1.5">
                    <span>Voir le Passeport Citoyen &amp; Dons HEMORA</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CARTE SIG INTERACTIVE OPENSTREETMAP (PLEINE LARGEUR) */}
        <Card className="border-slate-200 shadow-md bg-white overflow-hidden">
          <CardHeader className="p-5 pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Système d&apos;Information Géographique (SIG)
                  </span>
                  <span className="text-xs text-slate-500">IASO Bénin</span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-1">
                  Cartographie Sanitaire des 06 Pôles Territoriaux &amp; 77 Communes
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Supervision géodésique OpenStreetMap, capacités hospitalières et localisation des hôpitaux de zone.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setVueMode("map")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      vueMode === "map"
                        ? "bg-[#0a3764] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <MapIcon className="h-3.5 w-3.5" />
                    <span>Carte OSM</span>
                  </button>
                  <button
                    onClick={() => setVueMode("table")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      vueMode === "table"
                        ? "bg-[#0a3764] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <TableIcon className="h-3.5 w-3.5" />
                    <span>Tableau IASO</span>
                  </button>
                </div>

                <select
                  value={selectedPole}
                  onChange={(e) => setSelectedPole(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="ALL">Tous les 06 Pôles Territoriaux</option>
                  {POLES_DEVELOPPEMENT_BENIN.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.communes.length} com.)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {vueMode === "map" ? (
              <div className="p-4">
                <OpenStreetMapTerritoire
                  selectedPoleId={selectedPole}
                  onPoleSelect={(pId) => setSelectedPole(pId)}
                  showFilters={true}
                />
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Code IASO</TableHead>
                      <TableHead>Établissement</TableHead>
                      <TableHead>Pôle Territorial</TableHead>
                      <TableHead>Commune</TableHead>
                      <TableHead className="text-center">Capacité (Lits)</TableHead>
                      <TableHead className="text-center">Statut ARS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFacilities.map((fac) => (
                      <TableRow key={fac.id || fac.codeIaso} className="hover:bg-slate-50">
                        <TableCell className="font-mono font-bold text-[#0a3764]">{fac.codeIaso}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{fac.nom}</TableCell>
                        <TableCell className="text-slate-700">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            {fac.poleNom || "Pôle Sanitaire"}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600">{fac.commune}</TableCell>
                        <TableCell className="text-center font-bold text-slate-900">
                          {fac.capaciteLits || 50}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            Homologué
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SECTION CELLULE D'INSPECTION & SIGNALEMENTS CITOYENS (SHADCN TABLE) */}
        <Card className="border-red-200 shadow-md bg-white">
          <CardHeader className="p-5 pb-3 bg-red-50/50 border-b border-red-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold border border-red-200 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Inspection Générale de la Santé &bull; Signalements Citoyens Directs
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Plaintes déposées par les usagers (Refus d&apos;admission vitale, caution illégale, rançonnement)
                  </CardDescription>
                </div>
              </div>

              <Badge variant="destructive" className="text-xs font-bold font-mono">
                {signalements.length} dossier(s) actif(s)
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <div className="rounded-xl border border-slate-200 overflow-hidden mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Dossier</TableHead>
                    <TableHead>Motif de Plainte</TableHead>
                    <TableHead>Établissement &amp; Commune</TableHead>
                    <TableHead>Plaignant</TableHead>
                    <TableHead>Gravité</TableHead>
                    <TableHead className="text-center">Statut d&apos;Instruction</TableHead>
                    <TableHead className="text-center">Décision Régalienne</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signalements.map((sig) => (
                    <TableRow key={sig.codeDossier || sig.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono font-bold text-red-600">
                        {sig.codeDossier}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-900 block">{sig.typeInfractionLabel}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                          {sig.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{sig.etablissementNom}</div>
                        <div className="text-[10px] text-slate-500">{sig.commune} ({sig.departement})</div>
                      </TableCell>
                      <TableCell>
                        {sig.anonyme ? (
                          <span className="text-slate-400 italic">Anonyme (Protégé)</span>
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-900">{sig.declarantNom || "Bio GOUDA"}</span>
                            <span className="block text-[10px] font-mono text-slate-400">{sig.declarantNpi}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                          {sig.gravite}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {sig.statut === "INSPECTEUR_DEPECHE"
                            ? "Inspecteur Dépêché"
                            : sig.statut === "SANCTION_PRONONCEE"
                            ? "Sanction Prononcée"
                            : "En Instruction"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => {
                              sig.statut = "INSPECTEUR_DEPECHE";
                              sig.reponseMinistere = "Mission d'inspection immédiate diligentée sur place par arrêté ministériel.";
                              setSignalements([...signalements]);
                              handleTriggerInspection(sig.etablissementNom, `Instruction du signalement #${sig.id}: ${sig.motif}`);
                            }}
                            className="bg-red-700 hover:bg-red-800 text-white font-bold text-[10px] h-7 px-2.5 cursor-pointer"
                          >
                            Dépêcher
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              sig.statut = "SANCTION_PRONONCEE";
                              sig.reponseMinistere = "Sanction administrative conservatoire prise : suspension à titre conservatoire.";
                              setSignalements([...signalements]);
                              setInspectionMsg(`Arrêté de sanction administrative notifié pour ${sig.etablissementNom}.`);
                            }}
                            className="font-bold text-[10px] h-7 px-2.5 cursor-pointer"
                          >
                            Sanctionner
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* MODAL RÉGALIENNE : MANDAT MINISTÉRIEL D'INSPECTION IGS */}
        {showMandatModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4"
            onClick={() => setShowMandatModal(null)}
          >
            <div
              className="w-full max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl border border-red-900/40 bg-white p-5 sm:p-8 shadow-2xl flex flex-col gap-5 text-left text-slate-900 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Entête officielle */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3.5 rounded-xs bg-[#008751]" />
                    <div className="h-3 w-3.5 rounded-xs bg-[#FCD116]" />
                    <div className="h-3 w-3.5 rounded-xs bg-[#E8112D]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block">
                      RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE LA SANTÉ
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      INSPECTION GÉNÉRALE DES SERVICES DE SANTÉ (IGS)
                    </span>
                  </div>
                </div>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  Mandat Régalien Actif
                </Badge>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Arrêté Ministériel Portant Mission d&apos;Inspection Inopinée
                </h3>
                <p className="text-xs font-mono text-slate-500 font-semibold">
                  Réf. Officielle : {showMandatModal.id} • Décret n° 2026-412/PR/MS
                </p>
              </div>

              {/* Fiche de mission régalienne */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Établissement Visé</span>
                  <span className="font-bold text-slate-900 text-sm block">
                    {showMandatModal.etablissement}
                  </span>
                  <span className="text-[10px] text-slate-500">Contrôle physique sur site & réquisition APDP</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Autorité Signataire</span>
                  <span className="font-bold text-slate-900 block">{showMandatModal.ministre}</span>
                  <span className="text-[10px] text-slate-500">Ministre de la Santé de la République du Bénin</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-500 block font-semibold">Motif et Base Légale</span>
                  <span className="font-medium text-slate-800 leading-relaxed block">
                    {showMandatModal.motif} (Loi n° 2017-20 et Décret de gratuité des urgences 0 FCFA).
                  </span>
                </div>
              </div>

              {/* Scellé QR Code vérifiable */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center gap-2">
                <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={`https://beninvie.bj/verify?token=${showMandatModal.id}`}
                    size={130}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-700 font-bold">
                  {showMandatModal.id} • SCELLÉ MINISTÉRIEL NUMÉRIQUE
                </span>
                <a
                  href={`/verify?token=${showMandatModal.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-red-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Tester le scellé sur le Guichet Public de Contrôle (/verify)</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Actions régaliennes */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-200">
                <Button
                  onClick={() => window.print()}
                  className="flex-1 min-h-[44px] bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Imprimer l&apos;Arrêté Officiel (PDF)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMandatModal(null)}
                  className="min-h-[44px] px-5 font-bold text-xs cursor-pointer"
                >
                  Fermer le Mandat
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
