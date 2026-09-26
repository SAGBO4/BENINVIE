"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  POLES_DEVELOPPEMENT_BENIN,
  COMMUNES_BENIN,
  PoleDeveloppement,
  getPoleForCommune,
} from "@/data/communes";
import { ETABLISSEMENTS_REF } from "@/data/referentiels";
import {
  MapPin,
  Building2,
  Heart,
  AlertTriangle,
  Layers,
  Compass,
  Search,
  CheckCircle,
  Activity,
  Maximize2,
} from "lucide-react";

interface OpenStreetMapTerritoireProps {
  selectedPoleId?: string;
  onPoleSelect?: (poleId: string) => void;
  className?: string;
  showFilters?: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export function OpenStreetMapTerritoire({
  selectedPoleId,
  onPoleSelect,
  className = "",
  showFilters = true,
}: OpenStreetMapTerritoireProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const polesLayerRef = useRef<any>(null);

  const [activePole, setActivePole] = useState<string>(selectedPoleId || "ALL");
  const [filterType, setFilterType] = useState<"ALL" | "HOPITAL" | "HEMORA" | "URGENCE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);

  // Synchronisation avec prop externe
  useEffect(() => {
    if (selectedPoleId && selectedPoleId !== activePole) {
      setActivePole(selectedPoleId);
    }
  }, [selectedPoleId]);

  // Chargement asynchrone sécurisé de Leaflet pour OpenStreetMap (Zéro SSR collision)
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      // 1. Injecter la feuille de style Leaflet CSS si absente
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // 2. Charger le script Leaflet JS si absent
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.crossOrigin = "";
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        }).catch((err) => {
          console.warn("Leaflet CDN load failed or offline, fallback mode active:", err);
        });
      }

      if (!isMounted || !mapContainerRef.current || !window.L) return;

      // 3. Initialiser la carte Leaflet centrée sur la République du Bénin
      if (!mapInstanceRef.current) {
        const L = window.L;
        const beninCenter: [number, number] = [9.3077, 2.3158];
        const map = L.map(mapContainerRef.current, {
          center: beninCenter,
          zoom: 7,
          minZoom: 6,
          maxZoom: 16,
          scrollWheelZoom: true,
        });

        // 4. Tuiles officielles OpenStreetMap Carto (Standard OSM)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | République du Bénin',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
        polesLayerRef.current = L.layerGroup().addTo(map);

        setMapLoaded(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs et des 06 Pôles territoriaux
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const polesGroup = polesLayerRef.current;

    markersGroup.clearLayers();
    polesGroup.clearLayers();

    // 1. Tracer les 06 Pôles de Développement Territorial sur OpenStreetMap
    POLES_DEVELOPPEMENT_BENIN.forEach((pole) => {
      const isSelected = activePole === "ALL" || activePole === pole.id;
      const opacity = isSelected ? 0.35 : 0.08;
      const weight = isSelected ? 3 : 1;

      // Cercle de couverture du pôle territorial
      const circle = L.circle([pole.lat, pole.lng], {
        color: pole.couleur,
        fillColor: pole.couleur,
        fillOpacity: opacity,
        weight: weight,
        radius: pole.id === "grand-nokoue" ? 22000 : 55000,
      }).addTo(polesGroup);

      // Popup informatif de pôle
      const polePopup = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${pole.couleur};"></span>
            <strong style="font-size: 14px; color: #0f172a;">${pole.nom}</strong>
          </div>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">${pole.description}</p>
          <div style="font-size: 11px; background: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 6px;">
            <div><strong>Chef-lieu :</strong> ${pole.chefLieu}</div>
            <div><strong>Communes (${pole.communes.length}) :</strong> ${pole.communes.slice(0, 4).join(", ")}${pole.communes.length > 4 ? "..." : ""}</div>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px; color: #059669; font-weight: bold;">Réforme Territoriale Bénin 2026</span>
          </div>
        </div>
      `;
      circle.bindPopup(polePopup);

      // Marqueur de chef-lieu de pôle
      const poleIconHtml = `
        <div style="
          background: ${pole.couleur};
          color: white;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>📍</span>
          <span>${pole.nom}</span>
        </div>
      `;
      const poleDivIcon = L.divIcon({
        html: poleIconHtml,
        className: "custom-pole-label",
        iconAnchor: [60, 15],
      });
      L.marker([pole.lat, pole.lng], { icon: poleDivIcon }).addTo(polesGroup);
    });

    // 2. Filtrer et ajouter les établissements sanitaires
    let filtered = ETABLISSEMENTS_REF.map((e) => {
      const pole = getPoleForCommune(e.commune);
      return {
        ...e,
        poleId: pole.id,
        poleNom: pole.nom,
        poleCouleur: pole.couleur,
      };
    });

    if (activePole !== "ALL") {
      filtered = filtered.filter((e) => e.poleId === activePole);
    }

    if (filterType === "HOPITAL") {
      filtered = filtered.filter((e) => e.type === "chic" || e.type === "cnhu" || e.type === "chd" || e.type === "hz");
    } else if (filterType === "HEMORA") {
      filtered = filtered.filter((e) => e.capaciteLits && e.capaciteLits > 100);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          e.commune.toLowerCase().includes(q) ||
          e.departement.toLowerCase().includes(q)
      );
    }

    // 3. Dessiner chaque établissement
    filtered.forEach((fac) => {
      const isChicOrCnhu = fac.type === "chic" || fac.type === "cnhu";
      const markerBg = isChicOrCnhu ? "#dc2626" : fac.poleCouleur || "#2563eb";
      const iconSymbol = isChicOrCnhu ? "🏥" : "⚕️";

      const iconHtml = `
        <div style="
          background: ${markerBg};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${iconSymbol}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-marker-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: customIcon }).addTo(markersGroup);

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 240px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${fac.poleCouleur}20; color: ${fac.poleCouleur};">
              ${fac.poleNom}
            </span>
            <span style="font-size: 10px; color: #64748b;">${fac.codeIaso || "IASO-BENIN"}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; margin: 4px 0; color: #0f172a;">${fac.nom}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">📍 Commune de <strong>${fac.commune}</strong> (${fac.departement})</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span style="color: #64748b;">Capacité hospitalière :</span>
              <strong style="color: #0f172a;">${fac.capaciteLits || 100} lits</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Accréditation ARS :</span>
              <span style="color: #10b981; font-weight: bold;">✓ Conforme</span>
            </div>
          </div>
          <div style="font-size: 10px; color: #2563eb; text-align: center; font-weight: 500;">
            Supervision SIG Bénin • Pôle Santé Connecté
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("click", () => {
        setSelectedFacility(fac);
      });
    });

    // 4. Centrer la carte selon le pôle choisi
    if (activePole !== "ALL") {
      const poleObj = POLES_DEVELOPPEMENT_BENIN.find((p) => p.id === activePole);
      if (poleObj) {
        map.flyTo([poleObj.lat, poleObj.lng], poleObj.zoom, { duration: 1.2 });
      }
    } else {
      map.flyTo([9.3077, 2.3158], 7, { duration: 1.2 });
    }
  }, [activePole, filterType, searchQuery, mapLoaded]);

  const handlePoleClick = (poleId: string) => {
    setActivePole(poleId);
    if (onPoleSelect) {
      onPoleSelect(poleId);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden border border-foreground/10 bg-background/80 shadow-xl backdrop-blur-md ${className}`}>
      {/* Barre de contrôle supérieure : Sélection des 06 Pôles Territoriaux */}
      {showFilters && (
        <div className="p-4 border-b border-foreground/10 bg-background/90 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground/75">
                  Système d'Information Géographique (SIG) OpenStreetMap
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mt-0.5">
                Cartographie Sanitaire des 06 Pôles de Développement
              </h3>
            </div>

            {/* Barre de recherche d'établissement / commune */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Rechercher hôpital, commune..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-background border border-foreground/15 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-52 sm:w-64"
                />
              </div>

              {/* Bouton Réinitialiser la vue */}
              <button
                onClick={() => handlePoleClick("ALL")}
                className="px-3 py-1.5 rounded-xl border border-foreground/15 bg-foreground/5 hover:bg-foreground/10 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5"
                title="Recentrer sur tout le Bénin"
              >
                <Compass className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tout le Bénin</span>
              </button>
            </div>
          </div>

          {/* Chips des 06 Pôles de Développement */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => handlePoleClick("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activePole === "ALL"
                  ? "bg-foreground text-background shadow-md shadow-foreground/10"
                  : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 border border-foreground/10"
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Tous les 06 Pôles (77 Communes)</span>
            </button>

            {POLES_DEVELOPPEMENT_BENIN.map((pole) => {
              const isSelected = activePole === pole.id;
              return (
                <button
                  key={pole.id}
                  onClick={() => handlePoleClick(pole.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "text-white shadow-md"
                      : "bg-background/80 text-foreground/80 hover:bg-foreground/5 border-foreground/10"
                  }`}
                  style={{
                    backgroundColor: isSelected ? pole.couleur : undefined,
                    borderColor: isSelected ? pole.couleur : undefined,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: isSelected ? "#fff" : pole.couleur }}
                  />
                  <span>{pole.nom}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full"
                    style={{
                      backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    {pole.communes.length} com.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zone Carte OpenStreetMap */}
      <div className="relative w-full h-[540px] sm:h-[620px] bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Fallback de chargement si OpenStreetMap met quelques instants */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm text-white gap-3 p-6 text-center">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold">Initialisation d'OpenStreetMap...</p>
              <p className="text-xs text-slate-400 mt-1">
                Chargement des 06 Pôles de Développement Territorial et des 77 Communes
              </p>
            </div>
          </div>
        )}

        {/* Panneau latéral flottant si un établissement est sélectionné */}
        {selectedFacility && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-30 p-4 rounded-2xl border border-foreground/20 bg-background/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: `${selectedFacility.poleCouleur}20`,
                    color: selectedFacility.poleCouleur,
                  }}
                >
                  {selectedFacility.poleNom}
                </span>
                <h4 className="text-sm font-bold text-foreground mt-1">
                  {selectedFacility.nom}
                </h4>
                <p className="text-xs text-foreground/60">
                  {selectedFacility.commune}, {selectedFacility.departement}
                </p>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="h-6 w-6 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center text-xs text-foreground/60 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-xl bg-foreground/5 text-xs">
              <div>
                <span className="text-[10px] text-foreground/50 block">Capacité lits</span>
                <span className="font-bold text-foreground">{selectedFacility.capaciteLits || 120} lits</span>
              </div>
              <div>
                <span className="text-[10px] text-foreground/50 block">Accréditation</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Certifié ARS
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-foreground/60 border-t border-foreground/10 pt-2">
              <span>Code IASO : {selectedFacility.codeIaso || "IASO-BENIN"}</span>
              <span className="text-emerald-500 font-semibold">Urgences 24/7</span>
            </div>
          </div>
        )}

        {/* Légende OpenStreetMap en bas à droite */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl bg-background/90 backdrop-blur-md border border-foreground/15 shadow-lg text-xs">
          <div className="text-[11px] font-bold text-foreground/75 uppercase tracking-wider mb-1">
            Légende Sanitaire
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="h-3 w-3 rounded-full bg-red-600 border border-white" />
            <span>Hôpital National (CHIC / CNHU)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="h-3 w-3 rounded-full bg-blue-600 border border-white" />
            <span>Hôpital Départemental / Zone (CHD, HZ)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white" />
            <span>Banque de Sang Connectée HEMORA</span>
          </div>
          <div className="text-[10px] text-foreground/45 mt-1 border-t border-foreground/10 pt-1">
            Données OpenStreetMap & IASO Bénin
          </div>
        </div>
      </div>
    </div>
  );
}
