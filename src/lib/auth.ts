import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const SESSION_COOKIE_NAME = "guy_admin_session";
const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type StoredAuth = {
  passwordHash: string;
  salt: string;
  lastChangedAt: string;
};

export type PasswordChangeStatus = {
  canChange: boolean;
  lastChangedAt: string | null;
  nextAllowedDate: string | null;
  daysRemaining: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const AUTH_FILE = path.join(DATA_DIR, "auth.json");
export const PASSWORD_CHANGE_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in ms

export async function getStoredAuth(): Promise<StoredAuth | null> {
  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("portfolio_content")
          .select("data")
          .eq("id", "auth_security")
          .single();

        if (!error && data?.data?.passwordHash && data?.data?.salt) {
          return data.data as StoredAuth;
        }
      }
    } catch (err) {
      console.warn("Could not check Supabase auth:", err);
    }
  }

  // 2. Try local file
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const content = fs.readFileSync(AUTH_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed?.passwordHash && parsed?.salt) {
        return parsed as StoredAuth;
      }
    }
  } catch (err) {
    console.error("Local auth read error:", err);
  }

  return null;
}

export async function saveStoredAuth(auth: StoredAuth): Promise<void> {
  // 1. Save local file
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), "utf-8");
  } catch (err) {
    console.error("Local auth write error:", err);
  }

  // 2. Save Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from("portfolio_content").upsert(
          {
            id: "auth_security",
            data: auth,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }
    } catch (err) {
      console.error("Supabase auth write error:", err);
    }
  }
}

// Resolve secret key
function getAuthSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.JWT_SECRET_KEY;
  if (secret) return secret;
  return "guy-portfolio-secret-key-32-chars-long-secure-salt";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "guyweb3@2026";
}

export async function verifyPassword(inputPassword: string): Promise<boolean> {
  const stored = await getStoredAuth();
  if (stored) {
    const computedHash = crypto
      .scryptSync(inputPassword, stored.salt, 64)
      .toString("hex");
    const computedBuf = Buffer.from(computedHash);
    const targetBuf = Buffer.from(stored.passwordHash);
    if (computedBuf.length !== targetBuf.length) {
      crypto.timingSafeEqual(computedBuf, computedBuf);
      return false;
    }
    return crypto.timingSafeEqual(computedBuf, targetBuf);
  }

  const targetPassword = getAdminPassword();
  const inputBuf = Buffer.from(inputPassword);
  const targetBuf = Buffer.from(targetPassword);
  if (inputBuf.length !== targetBuf.length) {
    crypto.timingSafeEqual(inputBuf, inputBuf);
    return false;
  }
  return crypto.timingSafeEqual(inputBuf, targetBuf);
}

export async function getPasswordChangeStatus(): Promise<PasswordChangeStatus> {
  const stored = await getStoredAuth();
  if (!stored || !stored.lastChangedAt) {
    return {
      canChange: true,
      lastChangedAt: null,
      nextAllowedDate: null,
      daysRemaining: 0,
    };
  }

  const lastChangedTime = new Date(stored.lastChangedAt).getTime();
  const now = Date.now();
  const elapsed = now - lastChangedTime;

  if (elapsed < PASSWORD_CHANGE_INTERVAL_MS) {
    const remainingMs = PASSWORD_CHANGE_INTERVAL_MS - elapsed;
    const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    const nextAllowedDate = new Date(
      lastChangedTime + PASSWORD_CHANGE_INTERVAL_MS
    ).toISOString();
    return {
      canChange: false,
      lastChangedAt: stored.lastChangedAt,
      nextAllowedDate,
      daysRemaining,
    };
  }

  return {
    canChange: true,
    lastChangedAt: stored.lastChangedAt,
    nextAllowedDate: null,
    daysRemaining: 0,
  };
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; nextAllowedDate?: string | undefined }> {
  // 1. Verify current password
  const isCurrentValid = await verifyPassword(currentPassword);
  if (!isCurrentValid) {
    return { success: false, error: "Mot de passe actuel incorrect." };
  }

  // 2. Check 2-week restriction
  const status = await getPasswordChangeStatus();
  if (!status.canChange) {
    const formattedDate = status.nextAllowedDate
      ? new Date(status.nextAllowedDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : `${status.daysRemaining} jours`;

    return {
      success: false,
      error: `Modification non autorisée. L'intervalle minimal entre deux changements est de 2 semaines (14 jours). Prochaine modification possible le : ${formattedDate} (dans ${status.daysRemaining} jour${status.daysRemaining > 1 ? "s" : ""}).`,
      ...(status.nextAllowedDate ? { nextAllowedDate: status.nextAllowedDate } : {}),
    };
  }

  // 3. Validate new password
  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: "Le nouveau mot de passe doit comporter au moins 8 caractères.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "Le nouveau mot de passe doit être différent de l'ancien.",
    };
  }

  // 4. Hash and save
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.scryptSync(newPassword, salt, 64).toString("hex");
  const lastChangedAt = new Date().toISOString();

  await saveStoredAuth({
    passwordHash,
    salt,
    lastChangedAt,
  });

  const nextAllowedDate = new Date(
    Date.now() + PASSWORD_CHANGE_INTERVAL_MS
  ).toISOString();

  return {
    success: true,
    nextAllowedDate,
  };
}

export function createSessionToken(): string {
  const secret = getAuthSecret();
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}:${random}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}:${hmac}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [timestampStr, random, signature] = parts;
    if (!timestampStr || !random || !signature) return false;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiry
    const maxAgeMs = SESSION_EXPIRY_SECONDS * 1000;
    if (Date.now() - timestamp > maxAgeMs) {
      return false;
    }

    const payload = `${timestampStr}:${random}`;
    const secret = getAuthSecret();
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(sessionToken);
}

export async function setAdminSession(): Promise<string> {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRY_SECONDS,
  });
  return token;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
