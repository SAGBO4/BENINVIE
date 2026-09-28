"use client";

import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Wifi,
  Heart,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Smartphone,
  Cpu,
  User,
  Radio,
  Volume2,
  VolumeX,
  RotateCw,
  QrCode,
  Check,
  Zap,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export interface NfcCardData {
  uid: string;
  typeCarte: "DONNEUR_HEMORA" | "PATIENT_BIOMETRIQUE";
  nom: string;
  prenom: string;
  npi: string;
  groupeSanguin: string;
  rhesus: string;
  statutDon: "APTE" | "AJOURNE" | "RESERVATION";
  nbDons: number;
  dernierDon: string;
  prochainDon: string;
  pointsSanteMoMo: number;
  allergies: string[];
  contactUrgence: {
    nom: string;
    relation: string;
    telephone: string;
  };
  scelleSha256: string;
}

const DEFAULT_NFC_CARD: NfcCardData = {
  uid: "04:C8:7B:A2:3F:89:E1",
  typeCarte: "DONNEUR_HEMORA",
  nom: "SAGBOHAN",
  prenom: "Chantal",
  npi: "NPI-CIT-1995-1029",
  groupeSanguin: "O+",
  rhesus: "RH+ (Positif)",
  statutDon: "APTE",
  nbDons: 8,
  dernierDon: "12 Janvier 2026",
  prochainDon: "12 Mars 2026",
  pointsSanteMoMo: 400,
  allergies: ["Pénicilline (réaction modérée)"],
  contactUrgence: {
    nom: "SAGBOHAN Bio",
    relation: "Conjoint",
    telephone: "+229 97 00 12 34",
  },
  scelleSha256: "0x8fa3d94b216c802e88a01f92e44517b9c9f28a30e15998a4176cfbc0217a9421",
};

export function NfcCardConsole({
  initialCard = DEFAULT_NFC_CARD,
  userRole = "CITOYEN",
}: {
  initialCard?: NfcCardData;
  userRole?: string;
}) {
  const [card, setCard] = useState<NfcCardData>(initialCard);
  const [isFlipped, setIsFlipped] = useState(false);
  const [readerState, setReaderState] = useState<"IDLE" | "SCANNING" | "DETECTED" | "WRITING">("IDLE");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [webNfcSupported, setWebNfcSupported] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Lecteur de comptoir prêt");
  const [writeSuccess, setWriteSuccess] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      setWebNfcSupported(true);
    }
  }, []);

  // Bip sonore synthétisé Web Audio
  const playBeep = (freq1 = 880, freq2 = 1760, duration = 0.08) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, now);
      osc.frequency.setValueAtTime(freq2, now + duration / 2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio fallback silencieux si restreint par autoplay
    }
  };

  // Simulation de détection sans contact
  const handleTapCard = () => {
    setReaderState("SCANNING");
    setStatusMessage("Champ magnétique actif • Lecture des blocs ISO 14443...");
    setWriteSuccess(false);

    setTimeout(() => {
      setReaderState("DETECTED");
      setStatusMessage("Carte sans contact détectée avec succès !");
      playBeep(987, 1975, 0.12);
    }, 600);
  };

  // Écriture d'un nouveau don sur la puce (pour agent CNTS / soignant)
  const handleWriteNewDonation = () => {
    setReaderState("WRITING");
    setStatusMessage("Encodage cryptographique du prélèvement sur la puce NFC...");

    setTimeout(() => {
      setCard((prev) => ({
        ...prev,
        nbDons: prev.nbDons + 1,
        dernierDon: new Date().toLocaleDateString("fr-BJ", { day: "2-digit", month: "long", year: "numeric" }),
        pointsSanteMoMo: prev.pointsSanteMoMo + 50,
      }));
      setReaderState("DETECTED");
      setWriteSuccess(true);
      setStatusMessage("Don de 450 mL et 50 Pts inscrits avec succès dans la puce !");
      playBeep(1200, 2400, 0.15);
    }, 900);
  };

  // Vrai scan matériel Web NFC si disponible
  const handleStartRealWebNfc = async () => {
    if (!webNfcSupported) return;
    try {
      setStatusMessage("Approchez votre carte physique du dos du terminal...");
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      ndef.onreading = (event: any) => {
        playBeep(987, 1975, 0.1);
        setReaderState("DETECTED");
        setStatusMessage(`Carte physique lue ! Numéro de série : ${event.serialNumber}`);
      };
    } catch (error: any) {
      setStatusMessage(`Erreur Web NFC : ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      {/* En-tête officiel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>NFC Sans Contact ISO/IEC 14443 • Scellé Sécurisé ANIP</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Carte Nationale NFC Donneur HEMORA & Patient
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Carte biométrique officielle équipée d&apos;une puce sans contact NTAG215. Utilisable en officine,
            dans les centres de transfusion CNTS et aux urgences du CNHU / CHUD pour identification instantanée.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title={soundEnabled ? "Couper le bip sonore" : "Activer le bip sonore"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#008751]" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>{isFlipped ? "Voir Recto" : "Voir Verso"}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* COLONNE 1 : RENDU RÉALISTE DE LA CARTE NFC PHYSIQUE (6 COLONNES) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md perspective-1000">
            {/* CARTE RECTO / VERSO */}
            {!isFlipped ? (
              /* RECTO */
              <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-[#0a3764] via-[#0d4680] to-[#062444] text-white p-5 shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden group transition-transform duration-300 hover:scale-[1.02]">
                {/* Guillochis / filigrane de sécurité arrière-plan */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,135,81,0.25)_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

                {/* En-tête de la carte */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Ruban officiel tricolore miniature */}
                    <div className="flex h-4 w-5 rounded-xs overflow-hidden shadow-xs">
                      <div className="w-1/3 bg-[#008751]" />
                      <div className="w-1/3 bg-[#ffbe00]" />
                      <div className="w-1/3 bg-[#eb0000]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-slate-200 uppercase block">
                        RÉPUBLIQUE DU BÉNIN
                      </span>
                      <span className="text-[8px] font-bold text-emerald-400 tracking-wider uppercase block">
                        MINISTÈRE DE LA SANTÉ • CNTS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/80">
                    <Wifi className="h-5 w-5 rotate-90 text-amber-300" />
                    <span className="text-[9px] font-mono font-bold tracking-widest">NFC</span>
                  </div>
                </div>

                {/* Section centrale : Puce dorée + Groupe Sanguin */}
                <div className="relative z-10 flex items-center justify-between my-2">
                  {/* Puce intelligente dorée */}
                  <div className="relative w-11 h-9 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-1 border border-amber-700/30 rounded-xs" />
                    <div className="w-full h-[1px] bg-amber-800/40" />
                    <div className="absolute h-full w-[1px] bg-amber-800/40" />
                    <Cpu className="h-4 w-4 text-amber-950/60" />
                  </div>

                  {/* Badge Groupe Sanguin imposant */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-600/90 border border-rose-400/40 shadow-md">
                    <Heart className="h-4 w-4 text-white fill-white" />
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider block font-bold text-rose-200">
                        GROUPE SANGUIN
                      </span>
                      <span className="text-xl font-black leading-none block">{card.groupeSanguin}</span>
                    </div>
                  </div>
                </div>

                {/* Bas de carte : Identité titulaire & NPI ANIP */}
                <div className="relative z-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[8px] font-mono text-slate-300 block uppercase tracking-wider">
                        TITULAIRE ACCRÉDITÉ
                      </span>
                      <span className="text-sm font-black tracking-wide uppercase block text-white drop-shadow-xs">
                        {card.nom} {card.prenom}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-0.5">
                        {card.npi}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider text-slate-300 block">
                        STATUT HEMORA
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                        {card.statutDon} • {card.nbDons} DONS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* VERSO */
              <div className="relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl border border-slate-700 flex flex-col justify-between overflow-hidden transition-transform duration-300">
                {/* Piste magnétique noire */}
                <div className="w-full h-10 bg-black mt-4 shadow-inner" />

                {/* Zone de signature + QR Code de secours */}
                <div className="px-5 py-2 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="bg-slate-200 h-7 rounded flex items-center px-3 text-slate-800 text-[10px] font-mono italic">
                      Signature titulaire : {card.prenom} {card.nom}
                    </div>
                    <div className="mt-1 text-[8px] text-slate-400 font-mono">
                      UID NFC : {card.uid} • Scellé APDP
                    </div>
                  </div>

                  <a
                    href={`/verify?token=NFC-${card.npi}-${card.uid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Vérifier sur le Guichet National (/verify)"
                    className="bg-white p-1 rounded-lg shrink-0 shadow-sm hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer block"
                  >
                    <QRCodeSVG
                      value={`https://beninvie.bj/verify?token=NFC-${card.npi}-${card.uid}`}
                      size={48}
                      level="L"
                    />
                  </a>
                </div>

                {/* Mentions légales */}
                <div className="px-5 pb-3 text-[7px] text-slate-400 leading-tight border-t border-slate-800 pt-1.5">
                  Carte strictement personnelle. En cas d&apos;urgence vitale, la présentation de cette carte
                  ouvre droit au protocole de gratuité immédiate 0 FCFA (Décret d&apos;urgence sanitaire).
                  Service d&apos;assistance 24/7 : 136 (SAMU Bénin).
                </div>
              </div>
            )}
          </div>

          {/* Raccourci de clic pour interaction */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-start gap-2.5 w-full">
            <button
              onClick={handleTapCard}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0a3764] hover:bg-[#072544] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer text-center"
            >
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Simuler le passage sans contact</span>
            </button>
            <a
              href={`/verify?token=NFC-${card.npi}-${card.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer text-center"
            >
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Contrôler la signature (/verify)</span>
            </a>
          </div>
        </div>

        {/* COLONNE 2 : LECTEUR / TERMINAL DE COMPTOIR DE L'OFFICINE OU DU CNTS (6 COLONNES) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Boîtier du lecteur */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-3 w-3 rounded-full transition-all ${
                    readerState === "SCANNING"
                      ? "bg-amber-400 animate-ping"
                      : readerState === "DETECTED"
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : readerState === "WRITING"
                      ? "bg-blue-400 animate-pulse"
                      : "bg-slate-600"
                  }`}
                />
                <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                  TERMINAL SANS CONTACT PC/SC • BENINVIE-NFC-01
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-400">
                {readerState === "IDLE" ? "STANDBY" : readerState}
              </span>
            </div>

            {/* Écran d'état LED du terminal */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-xs mb-4">
              <div className="text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span>{statusMessage}</span>
              </div>
            </div>

            {/* Données instantanées lues de la carte */}
            {readerState === "DETECTED" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Identifiant Matériel UID</span>
                    <span className="font-mono font-bold text-white">{card.uid}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Groupe & Rhésus</span>
                    <span className="font-bold text-rose-400">
                      {card.groupeSanguin} • {card.rhesus}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Historique Transfusionnel</span>
                    <span className="font-bold text-emerald-400">{card.nbDons} Dons effectués</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Crédit MoMo Santé</span>
                    <span className="font-bold text-amber-400">{card.pointsSanteMoMo} Pts (-{card.pointsSanteMoMo * 10} F)</span>
                  </div>
                </div>

                {/* Fiche d'allergie critique lue en direct */}
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs">
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Alerte Médicale d&apos;Urgence :</span>
                  </div>
                  <p className="text-red-200">
                    {card.allergies.join(", ") || "Aucune allergie létale signalée"}
                  </p>
                  <p className="text-[10px] text-red-300 mt-1">
                    Contact d&apos;urgence : {card.contactUrgence.nom} ({card.contactUrgence.telephone})
                  </p>
                </div>

                {/* Actions réservées aux structures sanitaires (CNTS / Officines) */}
                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleWriteNewDonation}
                    className="min-h-[44px] flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Heart className="h-3.5 w-3.5" />
                    <span>Inscrire Nouveau Don (450 mL)</span>
                  </button>

                  <a
                    href={`/verify?token=NFC-${card.npi}-${card.uid}`}
                    className="min-h-[44px] py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Contrôle APDP</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Support matériel réel Web NFC */}
          {webNfcSupported && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-700 shrink-0" />
                <span>Antenne Web NFC native détectée sur cet appareil.</span>
              </div>
              <button
                onClick={handleStartRealWebNfc}
                className="min-h-[44px] px-3 py-1.5 bg-blue-700 text-white rounded-lg font-bold text-[11px] hover:bg-blue-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                Activer capteur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
