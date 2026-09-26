"use client";

import React, { useState } from "react";
import { Button, Badge } from "../ui/Primitives";
import { executeSimulatedPayment, SimulatedPaymentResult } from "@/lib/simulation";

interface MobileMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  montantDefault?: number;
  motifDefault?: string;
  telephoneDefault?: string;
  onSuccess?: (tx: SimulatedPaymentResult) => void;
}

export function MobileMoneyModal({
  isOpen,
  onClose,
  montantDefault = 5000,
  motifDefault = "Paiement santé Gbɛ",
  telephoneDefault = "+229 01 97 00 12 34",
  onSuccess,
}: MobileMoneyModalProps) {
  const [operateur, setOperateur] = useState<"MTN_MOMO" | "MOOV_MONEY" | "CELTIIS">("MTN_MOMO");
  const [telephone, setTelephone] = useState(telephoneDefault);
  const [montant, setMontant] = useState(montantDefault);
  const [motif] = useState(motifDefault);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<SimulatedPaymentResult | null>(null);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const tx = executeSimulatedPayment({
        operateur,
        telephone,
        montantFcfa: montant,
        motif,
      });
      setIsProcessing(false);
      setCompletedTx(tx);
      if (onSuccess) onSuccess(tx);
    }, 800);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "480px",
          width: "100%",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>💳</span>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
              Passerelle Mobile Money (FCFA)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {completedTx ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
            <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#166534", marginBottom: "8px" }}>
              Paiement Confirmé !
            </h4>
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
              La transaction a été validée et enregistrée en base de données.
            </p>
            <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", textAlign: "left", fontSize: "13px", marginBottom: "20px" }}>
              <div><strong>Référence :</strong> {completedTx.referenceTransaction}</div>
              <div><strong>Opérateur :</strong> {completedTx.operateur}</div>
              <div><strong>Montant :</strong> {completedTx.montantFcfa.toLocaleString()} FCFA</div>
              <div><strong>Bénéficiaire :</strong> {completedTx.telephone}</div>
            </div>
            <Button onClick={onClose} style={{ width: "100%" }}>
              Fermer
            </Button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
                OPÉRATEUR BÉNINOIS
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {(["MTN_MOMO", "MOOV_MONEY", "CELTIIS"] as const).map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setOperateur(op)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: operateur === op ? "2px solid #008751" : "1px solid #cbd5e1",
                      backgroundColor: operateur === op ? "#e6f4ea" : "#ffffff",
                      color: operateur === op ? "#006b40" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {op === "MTN_MOMO" ? "🟡 MTN MoMo" : op === "MOOV_MONEY" ? "🔵 Moov Money" : "🟣 Celtiis Cash"}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
                NUMÉRO DE TÉLÉPHONE (+229)
              </label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
                MONTANT EN FCFA
              </label>
              <input
                type="number"
                value={montant}
                onChange={(e) => setMontant(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              />
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                Motif : {motif}
              </div>
            </div>

            <Button onClick={handlePay} disabled={isProcessing} style={{ width: "100%", padding: "12px" }}>
              {isProcessing ? "Traitement Mobile Money..." : `Confirmer le versement de ${montant.toLocaleString()} FCFA`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
