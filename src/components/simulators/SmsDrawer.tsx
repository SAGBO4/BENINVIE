"use client";

import React from "react";
import { Badge } from "../ui/Primitives";
import { MessageSquare, Phone } from "lucide-react";
import { SimulatedSmsResult } from "@/lib/simulation";

interface SmsDrawerProps {
  smsList: SimulatedSmsResult[];
}

export function SmsDrawer({ smsList }: SmsDrawerProps) {
  if (smsList.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <MessageSquare size={18} color="#008751" />
        <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
          Notifications SMS Simulées en Direct ({smsList.length})
        </h4>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
        {smsList.map((sms) => (
          <div
            key={sms.id}
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontWeight: "bold", color: "#0284c7" }}>
                📩 {sms.expediteur} ➔ {sms.destinataireTelephone}
              </span>
              <Badge variant="info">Langue : {sms.langue.toUpperCase()}</Badge>
            </div>
            <div style={{ color: "#334155", fontStyle: "italic" }}>"{sms.message}"</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              Reçu à {new Date(sms.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
