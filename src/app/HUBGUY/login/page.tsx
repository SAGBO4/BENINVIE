"use client";

import { Eye, EyeOff, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

export default function AdminLoginPage(): ReactNode {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password.trim()) {
      setError("Please enter your admin password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Incorrect password. Please try again.");
      } else {
        router.push("/HUBGUY");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to authenticate. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-foreground/10 bg-foreground/2 dark:bg-foreground/4 p-8 sm:p-10 shadow-lg backdrop-blur-md">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-14 w-14 rounded-2xl border border-foreground/10 bg-background flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="h-7 w-7 text-foreground/85" />
            </div>
            <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              HUB GUY
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Guy Tibro Web3 Management Hub
            </p>
          </div>

          {error ? (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your dashboard password"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-foreground/10 bg-background py-2.5 pr-10 pl-10 text-sm text-foreground placeholder:text-foreground/35 focus:border-foreground/30 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground/40 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-foreground py-2.5 text-sm font-medium tracking-tight text-background hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-foreground/8 pt-5 text-center">
            <a
              href="/"
              className="text-xs font-medium text-foreground/50 hover:text-foreground transition-colors"
            >
              &larr; Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
