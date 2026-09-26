"use client";

import React, { useState } from "react";
import { Button, Badge } from "../ui/Primitives";
import { Volume2, PhoneCall, StopCircle } from "lucide-react";

interface IvrAudioPlayerProps {
  titre?: string;
  langue?: string;
  transcription: string;
  telephone?: string;
}

export function IvrAudioPlayer({
  titre = "Rappel Vocal en Langue Locale",
  langue = "Bariba (Kalalé)",
  transcription,
  telephone = "+229 01 97 00 12 34",
}: IvrAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(transcription);
        utterance.lang = "fr-FR";
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlaying(false), 3000);
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PhoneCall size={18} color="#166534" />
          <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#166534", margin: 0 }}>
            {titre}
          </h4>
        </div>
        <Badge variant="benin">{langue}</Badge>
      </div>

      <p style={{ fontSize: "12px", color: "#475569", marginBottom: "10px" }}>
        Appel automatisé vers <strong>{telephone}</strong> (Relais digital sans smartphone)
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "12px",
          borderRadius: "8px",
          border: "1px dashed #86efac",
          fontSize: "13px",
          fontStyle: "italic",
          color: "#1e293b",
          marginBottom: "12px",
        }}
      >
        "{transcription}"
      </div>

      <Button
        onClick={handleTogglePlay}
        variant={isPlaying ? "danger" : "primary"}
        style={{ fontSize: "13px", padding: "6px 14px" }}
      >
        {isPlaying ? (
          <>
            <StopCircle size={15} /> Arrêter l'appel vocal
          </>
        ) : (
          <>
            <Volume2 size={15} /> Écouter le message vocal
          </>
        )}
      </Button>
    </div>
  );
}
