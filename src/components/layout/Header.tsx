"use client";

import React from "react";
import { Badge } from "../ui/Primitives";
import { Activity, ShieldAlert, HeartHandshake, Leaf, PhoneCall, History } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: "scenario", label: "🎬 Démo Officielle (Bio à Kalalé)", icon: Activity },
    { id: "patient", label: "🩺 Carnet Patient FHIR", icon: Activity },
    { id: "urgences", label: "🚨 Urgences & Bris de Glace", icon: ShieldAlert },
    { id: "hemora", label: "🩸 Urgence Sang (HEMORA)", icon: HeartHandshake },
    { id: "pharmacopee", label: "🌿 Pharmacopée ARS", icon: Leaf },
    { id: "asc", label: "📱 ASC Hors-Ligne", icon: PhoneCall },
    { id: "audit", label: "🛡️ Audit APDP", icon: History },
  ];

  return (
    <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "28px" }}>🩺</span>
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                  Gbɛ (BENINVIE) — Plateforme Nationale de Santé Numérique
                </h1>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  SIH Fédéré (SANTÉ+) • Urgences Vitales • Transfusion (HEMORA) • Pharmacopée ARS • ARCH / GBESSOKE
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Badge variant="benin">Programme Wadagni - Talata 2026</Badge>
            <Badge variant="success">Conforme APDP & ARS</Badge>
            <Badge variant="info">77 Communes IASO</Badge>
          </div>
        </div>

        {/* Barre d'onglets */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: isActive ? "#008751" : "#f1f5f9",
                  color: isActive ? "#ffffff" : "#475569",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
