"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Heart,
  FileText,
  UserCheck,
  Camera,
  QrCode as QrIcon,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Check,
  Award,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a3764]" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get("token") || "";
  const { user } = useAuth();

  // Mode de test/démo de rôle pour permettre de vérifier les droits d'accès
  const [selectedRole, setSelectedRole] = useState<string>(
    user?.role ? user.role.toUpperCase() : "CITOYEN"
  );

  const [inputToken, setInputToken] = useState<string>(tokenParam);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [dispenseSuccess, setDispenseSuccess] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"result" | "scanner" | "presets">("result");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Synchronisation avec l'utilisateur connecté
  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role.toUpperCase());
    }
  }, [user]);

  // Si un token est présent dans l'URL, lancer la vérification immédiatement
  useEffect(() => {
    if (tokenParam) {
      setInputToken(tokenParam);
      runVerification(tokenParam, selectedRole);
    }
  }, [tokenParam]);

  const runVerification = async (tokenToVerify: string, roleToTest: string) => {
    if (!tokenToVerify.trim()) return;
    setIsVerifying(true);
    setDispenseSuccess(null);

    try {
      const res = await fetch(
        `/api/v1/verify?token=${encodeURIComponent(tokenToVerify)}&role=${roleToTest}&actorNpi=${user?.npi || "SIMULATED-NPI"}`
      );
      const data = await res.json();
      setVerificationResult(data);
      setActiveTab("result");
    } catch (err: any) {
      setVerificationResult({
        success: false,
        valid: false,
        error: "Erreur de connexion au serveur de certification ANIP / BENINVIE",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    if (inputToken) {
      runVerification(inputToken, newRole);
    }
  };

  // Chargement rapide d'un jeton d'ordonnance ou de donneur pour test
  const loadPresetToken = async (type: "ORDONNANCE" | "DONNEUR_HEMORA", id?: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/v1/qr-tokens?type=${type}&id=${id || ""}`);
      const data = await res.json();
      if (data.success && data.data?.token) {
        setInputToken(data.data.token);
        runVerification(data.data.token, selectedRole);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDispenseAction = async (action: "DELIVRANCE" | "ENREGISTRER_DON") => {
    if (!inputToken) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/v1/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inputToken,
          actorRole: selectedRole,
          officineNom: "Grande Pharmacie Nationale de Cotonou",
          pharmacienNpi: user?.npi || "PHARM-BJ-ONPB-449",
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispenseSuccess(data);
      } else {
        alert(data.error || "Action refusée");
      }
    } catch (err: any) {
      alert("Erreur de délivrance: " + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Démarrage caméra pour scanner
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Impossible d'accéder à la caméra:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Bandeau officiel République du Bénin */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#008751]" />
        <div className="flex-1 bg-[#ffbe00]" />
        <div className="flex-1 bg-[#eb0000]" />
      </div>

      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#0a3764] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shrink-0">
                B
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#0a3764]">
                  BENIN<span className="text-[#008751]">VIE</span>
                </span>
                <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-600 uppercase tracking-wider truncate">
                  Guichet National de Vérification Cryptographique
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Acteur actif :</span>
              <span className="font-bold text-[#0a3764] truncate max-w-[150px]">
                {user ? `${user.nom} (${user.role})` : "Non connecté"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-300 rounded-lg p-1 text-xs">
              <span className="px-1.5 text-slate-600 font-medium text-[11px] sm:text-xs">Rôle simulé :</span>
              {(["PHARMACIEN", "CNTS_AGENT", "MEDECIN", "CITOYEN"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`min-h-[36px] sm:min-h-[38px] px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    selectedRole === r
                      ? "bg-[#0a3764] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {r === "PHARMACIEN"
                    ? "Pharmacien"
                    : r === "CNTS_AGENT"
                    ? "Agent CNTS"
                    : r === "MEDECIN"
                    ? "Médecin"
                    : "Citoyen"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* En-tête explicatif */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#0a3764] mb-3">
            <ShieldCheck className="h-4 w-4 text-[#008751] shrink-0" />
            <span>Sécurité APDP • Loi n° 2017-20 portant Code du Numérique</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Vérification de QR Code Sécurisé & Scellé ANIP
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
            Ce portail permet de vérifier en temps réel l&apos;authenticité cryptographique d&apos;une
            ordonnance numérique, d&apos;un carnet transfusionnel HEMORA ou d&apos;un dossier d&apos;urgence.
            Conformément à la loi béninoise sur les données de santé, <strong>seuls les acteurs de santé
            habilités</strong> peuvent décrypter les informations médicales confidentielles.
          </p>
        </div>

        {/* Barre d'outils de vérification */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab("result");
                }}
                className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === "result"
                    ? "bg-[#0a3764] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Résultat de Vérification
              </button>
              <button
                onClick={() => {
                  setActiveTab("scanner");
                  startCamera();
                }}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === "scanner"
                    ? "bg-[#0a3764] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Scanner Caméra / Douchette</span>
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setActiveTab("presets");
                }}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === "presets"
                    ? "bg-[#0a3764] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Exemples Officiels</span>
              </button>
            </div>

            <div className="text-[11px] sm:text-xs text-slate-600 font-medium">
              Contrôle HMAC-SHA256 • Nonce Anti-Rejeu • Horodatage Bitcoin OTS
            </div>
          </div>

          {/* Formulaire de saisie / vérification manuelle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Coller le jeton cryptographique BENINVIE (ou scanner via caméra / douchette)..."
                className="w-full min-h-[44px] pl-3.5 sm:pl-4 pr-16 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a3764] focus:bg-white"
              />
              {inputToken && (
                <button
                  onClick={() => setInputToken("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 text-xs font-bold p-1 cursor-pointer"
                >
                  Effacer
                </button>
              )}
            </div>

            <button
              onClick={() => runVerification(inputToken, selectedRole)}
              disabled={isVerifying || !inputToken.trim()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#0a3764] hover:bg-[#072544] text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                  <span>Vérification cryptographique...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-[#008751] shrink-0" />
                  <span>Vérifier l&apos;Authenticité</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* CONTENU SELON TAB */}
        {activeTab === "scanner" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-6 sm:mb-8 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Scanner un QR Code d&apos;Ordonnance ou Carte Donneur
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto mb-5 sm:mb-6">
              Placez le QR Code physique ou numérique devant la caméra de votre poste ou utilisez votre douchette USB de pharmacie.
            </p>

            <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto aspect-square bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-300">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-6 sm:inset-10 border-2 border-emerald-400 rounded-xl pointer-events-none animate-pulse">
                <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-emerald-400">
                  SCANNER ACTIF
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => loadPresetToken("ORDONNANCE", "ORD-2026-001")}
                className="min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer text-center"
              >
                Simuler scan Ordonnance #ORD-2026-001
              </button>
              <button
                onClick={() => loadPresetToken("DONNEUR_HEMORA", "HEM-DON-8871")}
                className="min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors cursor-pointer text-center"
              >
                Simuler scan Passeport Donneur HEMORA
              </button>
            </div>
          </div>
        )}

        {activeTab === "presets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Ordonnance Preset */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Ordonnance Sécurisée #ORD-2026-001</h3>
                    <p className="text-xs text-slate-600">Dossier Chantal SAGBOHAN • Gratuité ARCH 100%</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                  Prescription délivrable uniquement par les pharmaciens agréés. Si visualisée par un citoyen,
                  les médicaments sont masqués par le secret médical.
                </p>
              </div>
              <button
                onClick={() => loadPresetToken("ORDONNANCE", "ORD-2026-001")}
                className="min-h-[44px] w-full flex items-center justify-center py-2.5 px-4 bg-[#0a3764] hover:bg-[#072544] text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Charger cette Ordonnance
              </button>
            </div>

            {/* HEMORA Preset */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Passeport Donneur HEMORA #HEM-DON-8871</h3>
                    <p className="text-xs text-slate-600">Donneur O+ • 8 Dons effectués • 400 Pts MoMo</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                  Vérification du statut transfusionnel réservée aux agents du Centre National de Transfusion
                  Sanguine (CNTS) et services d&apos;urgence hospitaliers.
                </p>
              </div>
              <button
                onClick={() => loadPresetToken("DONNEUR_HEMORA", "HEM-DON-8871")}
                className="min-h-[44px] w-full flex items-center justify-center py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Charger ce Passeport Donneur
              </button>
            </div>
          </div>
        )}
        {/* AFFICHAGE DU RÉSULTAT */}
        {activeTab === "result" && (
          <div>
            {!inputToken ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                  <QrIcon className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">En attente de scan ou de jeton</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  Scannez un QR Code officiel avec votre caméra, ou cliquez sur l&apos;un des exemples officiels
                  ci-dessous pour tester la vérification cryptographique.
                </p>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => loadPresetToken("ORDONNANCE", "ORD-2026-001")}
                    className="min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-[#0a3764] text-white rounded-xl text-xs font-bold hover:bg-[#072544] transition-colors cursor-pointer text-center"
                  >
                    Tester Ordonnance #ORD-2026-001
                  </button>
                  <button
                    onClick={() => loadPresetToken("DONNEUR_HEMORA", "HEM-DON-8871")}
                    className="min-h-[44px] flex items-center justify-center px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer text-center"
                  >
                    Tester Donneur HEMORA #8871
                  </button>
                </div>
              </div>
            ) : isVerifying ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0a3764] mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-900">Contrôle de signature cryptographique...</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Vérification du scellé HMAC-SHA256 auprès du registre ANIP
                </p>
              </div>
            ) : verificationResult ? (
              <div>
                {/* 1. CAS SIGNATURE INVALIDE / DOCUMENT CORROMPU */}
                {!verificationResult.valid ? (
                  <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 sm:p-8 text-red-950 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-3 py-1 rounded-md bg-red-600 text-white text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                          ALERTE SÉCURITÉ APDP : DOCUMENT CORROMPU OU FALSIFIÉ
                        </span>
                        <h2 className="text-lg sm:text-xl font-black text-red-900">
                          Échec de la validation cryptographique
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
                          {verificationResult.error || "La signature cryptographique de ce QR code ne correspond pas aux registres officiels de la République du Bénin."}
                        </p>
                        <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-red-100 border border-red-200 text-xs font-mono text-red-900 break-words">
                          {verificationResult.legalNote ||
                            "Avis légal : L'altération ou la falsification de titres de prescription ou de documents transfusionnels constitue une infraction grave passible des sanctions prévues par la Loi 2017-20."}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !verificationResult.authorized ? (
                  /* 2. CAS DOCUMENT VALIDE MAIS ACTEUR NON HABILITÉ (CITOYEN OU RÔLE INADÉQUAT) */
                  <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-5 sm:p-8 text-amber-950 mb-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Lock className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                            SCELLÉ CRYPTOGRAPHIQUE VALIDE
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                            ACCÈS MÉDICAL RESTREINT
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-amber-950">
                          Document Protégé par le Secret Médical (Loi 2017-20)
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
                          Ce document est authentique et certifié par l&apos;ANIP, mais son contenu médical détaillé est 
                          <strong> réservé aux professionnels de santé habilités</strong> (
                          {verificationResult.rolesRequis?.join(", ")}).
                        </p>

                        <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                          <div>
                            <span className="text-slate-600 block">Identifiant Document :</span>
                            <span className="font-mono font-bold text-slate-900 break-all">{verificationResult.documentId}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Type de Document :</span>
                            <span className="font-bold text-slate-900">{verificationResult.documentType}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Patient NPI :</span>
                            <span className="font-mono font-bold text-slate-900">{verificationResult.patientNpiMasked}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block">Votre profil actuel :</span>
                            <span className="font-bold text-amber-800">{selectedRole} (Non autorisé)</span>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-2.5">
                          <p className="text-xs font-semibold text-amber-900 w-full">
                            Pour tester l&apos;accès légal complet, basculez sur un profil habilité :
                          </p>
                          {verificationResult.rolesRequis?.includes("PHARMACIEN") && (
                            <button
                              onClick={() => handleRoleChange("PHARMACIEN")}
                              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-[#0a3764] hover:bg-[#072544] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              Se connecter en tant que Pharmacien
                            </button>
                          )}
                          {verificationResult.rolesRequis?.includes("CNTS_AGENT") && (
                            <button
                              onClick={() => handleRoleChange("CNTS_AGENT")}
                              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                            >
                              Se connecter en tant qu&apos;Agent CNTS
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. CAS VALIDE ET ACTEUR HABILITÉ (PHARMACIEN, CNTS, MÉDECIN) */
                  <div className="space-y-6">
                    {/* Bannière de conformité légale */}
                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded-2xl p-4 sm:p-6 text-emerald-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-mono font-bold tracking-wider">
                              CONFORME & AUTHENTIFIÉ
                            </span>
                            <span className="text-xs text-emerald-800 font-bold">
                              Rôle vérifié : {selectedRole}
                            </span>
                          </div>
                          <h2 className="text-base sm:text-lg font-black text-emerald-950 mt-1">
                            Scellé Cryptographique ANIP Validé • Horodatage Bitcoin OTS
                          </h2>
                        </div>
                      </div>

                      <div className="text-left md:text-right text-xs shrink-0">
                        <span className="text-emerald-700 block font-mono text-[10px]">
                          PREUVE OTS : {verificationResult.otsProof}
                        </span>
                        <span className="text-emerald-800 font-mono text-[10px] truncate max-w-xs block">
                          EMPREINTE : {verificationResult.sha256Seal?.slice(0, 26)}...
                        </span>
                      </div>
                    </div>

                    {/* DÉTAIL SELON LE TYPE DE DOCUMENT */}
                    {verificationResult.payload?.type === "ORDONNANCE" && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                        <div className="bg-[#0a3764] text-white p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-mono font-bold text-amber-300">
                                ORDONNANCE SÉCURISÉE NATIONALE
                              </span>
                              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                                {verificationResult.payload.id}
                              </h3>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-xs text-slate-200 block">Émise le :</span>
                              <span className="text-xs font-mono font-bold">
                                {new Date(verificationResult.payload.issuedAt).toLocaleDateString("fr-BJ", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8 space-y-6">
                          {/* Informations Patient & Prescripteur */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div>
                              <span className="text-xs font-semibold text-slate-600 block uppercase">
                                Bénéficiaire / Patient
                              </span>
                              <p className="text-sm font-bold text-slate-900 mt-1">
                                {verificationResult.payload.patientNom}
                              </p>
                              <p className="text-xs font-mono text-slate-600">
                                NPI : {verificationResult.payload.patientNpi}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-600 block uppercase">
                                Médecin Prescripteur
                              </span>
                              <p className="text-sm font-bold text-slate-900 mt-1">
                                {verificationResult.payload.prescripteur?.nom || "Dr. Praticien Hospitalier"}
                              </p>
                              <p className="text-xs text-slate-600">
                                {verificationResult.payload.prescripteur?.structure || "Formation Sanitaire Bénin"}
                              </p>
                              <p className="text-[11px] font-mono text-slate-600">
                                Matricule : {verificationResult.payload.prescripteur?.matricule || "MS-MED-2026"}
                              </p>
                            </div>
                          </div>

                          {/* Liste des Médicaments Prescrits */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                              <Pill className="h-4 w-4 text-[#0a3764]" />
                              <span>Prescription Médicamenteuse Validée</span>
                            </h4>
                            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                              {verificationResult.payload.details?.medicaments?.map(
                                (m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 bg-white hover:bg-slate-50 transition-colors"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900 break-words">{m.nom}</p>
                                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                        Dosage : <span className="font-semibold text-slate-800">{m.dosage}</span> • Posologie : <span className="font-semibold text-slate-800">{m.posologie}</span>
                                      </p>
                                    </div>
                                    <div className="flex sm:flex-col sm:items-end justify-between items-center shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                      <span className="text-xs font-bold text-slate-900">
                                        Qté : {m.quantite}
                                      </span>
                                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 sm:mt-1">
                                        {m.remboursement}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Confirmation de délivrance */}
                          {dispenseSuccess ? (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <Check className="h-5 w-5 text-emerald-700 shrink-0" />
                                <span>{dispenseSuccess.message}</span>
                              </div>
                              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                Récépissé délivré à l&apos;officine le{" "}
                                {new Date(dispenseSuccess.certificatDelivrance?.dateHeure).toLocaleString("fr-BJ")} • Enregistré au registre central APDP.
                              </p>
                            </div>
                          ) : (
                            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                              <div className="text-xs text-slate-600">
                                Prise en charge intégrale Régime ARCH (0 FCFA reste à charge patient).
                              </div>
                              <button
                                onClick={() => handleDispenseAction("DELIVRANCE")}
                                disabled={isVerifying}
                                className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#008751] hover:bg-[#006e42] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                                <span>Valider la Délivrance en Officine</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* DÉTAIL POUR PASSEPORT DONNEUR HEMORA */}
                    {verificationResult.payload?.type === "DONNEUR_HEMORA" && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
                        <div className="bg-rose-700 text-white p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-mono font-bold text-rose-200">
                                CARNET TRANSFUSIONNEL NATIONAL CNTS • HEMORA
                              </span>
                              <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                                {verificationResult.payload.id}
                              </h3>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-2xl sm:text-3xl font-black text-white">
                                {verificationResult.payload.details?.groupeSanguin}
                              </span>
                              <span className="text-xs text-rose-200 block">
                                Rhésus {verificationResult.payload.details?.rhesus}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8 space-y-6">
                          {/* Synthèse du profil donneur */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-xs font-semibold text-slate-600 block">Donneur</span>
                              <span className="text-sm font-bold text-slate-900 block mt-1">
                                {verificationResult.payload.patientNom}
                              </span>
                              <span className="text-xs font-mono text-slate-600">
                                {verificationResult.payload.patientNpi}
                              </span>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-xs font-semibold text-slate-600 block">Historique</span>
                              <span className="text-sm font-bold text-rose-700 block mt-1">
                                {verificationResult.payload.details?.nbDons} Dons validés
                              </span>
                              <span className="text-xs text-slate-600">
                                Dernier : {verificationResult.payload.details?.dernierDon}
                              </span>
                            </div>

                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                              <span className="text-xs font-semibold text-slate-600 block">Solde MoMo Santé</span>
                              <span className="text-sm font-bold text-amber-700 block mt-1">
                                {dispenseSuccess?.nouveauSoldePoints ?? verificationResult.payload.details?.pointsMoMo} Points
                              </span>
                              <span className="text-xs text-slate-600">
                                Réductibles en pharmacie partenaire
                              </span>
                            </div>
                          </div>

                          {/* Contact d'urgence et sécurité */}
                          <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50 border border-blue-200">
                            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5">
                              Personne à Prévenir en Cas d&apos;Urgence
                            </h4>
                            <p className="text-xs text-blue-950 font-bold leading-relaxed">
                              {verificationResult.payload.details?.contactUrgence?.nom} ({verificationResult.payload.details?.contactUrgence?.relation}) • {verificationResult.payload.details?.contactUrgence?.telephone}
                            </p>
                          </div>

                          {dispenseSuccess ? (
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950">
                              <div className="flex items-center gap-2 font-bold text-sm">
                                <Check className="h-5 w-5 text-emerald-700 shrink-0" />
                                <span>{dispenseSuccess.message}</span>
                              </div>
                              <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                Nouveau total : {dispenseSuccess.nouveauNbDons} dons • Solde MoMo actualisé à {dispenseSuccess.nouveauSoldePoints} Pts.
                              </p>
                            </div>
                          ) : (
                            <div className="pt-4 border-t border-slate-200 flex justify-end">
                              <button
                                onClick={() => handleDispenseAction("ENREGISTRER_DON")}
                                disabled={isVerifying}
                                className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Heart className="h-4 w-4" />
                                <span>Consigner un Prélèvement Transfusionnel (450 mL)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
