"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MEDICAMENTS_MTA_CERTIFIES } from "@/data/referentiels";
import { Leaf, Search, ShieldCheck, QrCode, CheckCircle2, Building, Sparkles } from "lucide-react";

interface TradipraticienArs {
  id: string;
  numeroAccreditation: string;
  nomComplet: string;
  commune: string;
  departement: string;
  specialite: string;
}

const TRADIPRATICIENS_ARS: TradipraticienArs[] = [
  {
    id: "tradi-01",
    numeroAccreditation: "ARS-TRADI-BOR-2026-04",
    nomComplet: "Dah Sèssinou Dako",
    commune: "Parakou",
    departement: "Borgou",
    specialite: "Phytothérapie Pédiatrique & Anti-paludiques",
  },
  {
    id: "tradi-02",
    numeroAccreditation: "ARS-TRADI-ZOU-2026-11",
    nomComplet: "Mahi Tossou Houindo",
    commune: "Abomey",
    departement: "Zou",
    specialite: "Remèdes Hépatoprotecteurs & Détoxifiants",
  },
  {
    id: "tradi-03",
    numeroAccreditation: "ARS-TRADI-ATL-2026-02",
    nomComplet: "Mère Akouavi Gnacadja",
    commune: "Allada",
    departement: "Atlantique",
    specialite: "Soins Post-Partum Traditionnels & Galactogènes",
  },
  {
    id: "tradi-04",
    numeroAccreditation: "ARS-TRADI-ATA-2026-07",
    nomComplet: "El-Hadj Boukari Kora",
    commune: "Natitingou",
    departement: "Atacora",
    specialite: "Phytothérapie Respiratoire & Anti-inflammatoire",
  },
];

export function PharmacopeeCatalog() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMta = MEDICAMENTS_MTA_CERTIFIES.filter((m) => {
    const matchSearch =
      m.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.indication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-8 py-4">
      {/* 1. EN-TÊTE INSTITUTIONNEL */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <Badge className="bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase">
                Autorité de Régulation du secteur de la Santé (ARS)
              </Badge>
              <CardTitle as="h2" className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Filière Nationale de Pharmacopée Traditionnelle Certifiée
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            Conformément aux directives présidentielles 2026, structuration intégrale de la chaîne de valeur : homologation scientifique des Médicaments Traditionnels Améliorés (MTA), accréditation officielle des tradipraticiens et sécurisation par ordonnances numériques à QR code.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 2. BARRE DE RECHERCHE ET STATISTIQUES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, code ou indication (ex: Paludisme, Tension)..."
            className="pl-10 border-slate-800 bg-slate-900/80 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Total MTA Homologués :</span>
          <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 font-mono font-bold">
            {filteredMta.length} remèdes certifiés
          </Badge>
        </div>
      </div>

      {/* 3. GRILLE DES MÉDICAMENTS TRADITIONNELS AMÉLIORÉS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMta.map((mta) => (
          <Card
            key={mta.code}
            className="border-slate-800 bg-slate-900/70 hover:border-emerald-500/40 transition-all shadow-lg flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {mta.code}
                </span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-950/20 text-[10px]">
                  Homologué ARS
                </Badge>
              </div>
              <CardTitle as="h3" className="text-base text-white">{mta.nom}</CardTitle>
              <CardDescription className="text-xs text-slate-400">{mta.forme}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-1">
              <div>
                <strong className="text-slate-300">Indication Thérapeutique :</strong>
                <p className="text-slate-400 mt-0.5 leading-relaxed">{mta.indication}</p>
              </div>
              <div>
                <strong className="text-slate-300">Posologie Recommandée :</strong>
                <p className="text-slate-400 mt-0.5">{mta.posologie}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Laboratoire : <strong className="text-slate-400">{mta.producteur}</strong></span>
                <span className="text-emerald-400 font-medium">Prescriptible</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. REGISTRE DES TRADIPRATICIENS ACCRÉDITÉS ARS */}
      <Card className="border-slate-800 bg-slate-900/60 shadow-xl">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div className="space-y-1">
            <CardTitle as="h3" className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-400" />
              <span>Registre National des Tradipraticiens Accrédités ARS</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Praticiens habilités à délivrer des ordonnances certifiées pour les remèdes de la pharmacopée nationale.
            </CardDescription>
          </div>
          <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
            Habilitation Légale
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">N° Accréditation ARS</th>
                  <th className="p-3.5">Nom du Praticien</th>
                  <th className="p-3.5">Commune / Département</th>
                  <th className="p-3.5">Spécialité Pharmacopée</th>
                  <th className="p-3.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {TRADIPRATICIENS_ARS.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {t.numeroAccreditation}
                    </td>
                    <td className="p-3.5 font-medium text-white">{t.nomComplet}</td>
                    <td className="p-3.5 text-slate-300">{t.commune} ({t.departement})</td>
                    <td className="p-3.5 text-slate-400">{t.specialite}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Accrédité ARS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
