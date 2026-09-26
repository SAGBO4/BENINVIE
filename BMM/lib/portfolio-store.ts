import fs from "fs";
import path from "path";
import { DEFAULT_PORTFOLIO_DATA, PortfolioData } from "./portfolio-data";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(DEFAULT_PORTFOLIO_DATA, null, 2),
        "utf-8"
      );
    }
  } catch (err) {
    console.error("Failed to ensure portfolio data file:", err);
  }
}

export async function getPortfolioData(): Promise<PortfolioData> {
  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("portfolio_content")
          .select("data")
          .eq("id", "main")
          .single();

        if (!error && data?.data) {
          return {
            ...DEFAULT_PORTFOLIO_DATA,
            ...data.data,
            profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(data.data.profile || {}) },
          };
        }
      }
    } catch (err) {
      console.warn("Supabase fetch error, falling back to local store:", err);
    }
  }

  // 2. Fallback to local JSON file
  ensureDataFile();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content) as PortfolioData;
      return {
        ...DEFAULT_PORTFOLIO_DATA,
        ...parsed,
        profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
      };
    }
  } catch (err) {
    console.error("Local JSON read error, returning default data:", err);
  }

  return DEFAULT_PORTFOLIO_DATA;
}

export async function updatePortfolioData(
  newData: PortfolioData
): Promise<{ success: boolean; error?: string }> {
  // 1. Save to local file cache
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing to local portfolio.json:", err);
  }

  // 2. If Supabase is configured, sync to Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from("portfolio_content").upsert(
          {
            id: "main",
            data: newData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("Supabase upsert error:", error);
          return {
            success: false,
            error: `Saved locally, but Supabase error: ${error.message}`,
          };
        }
      }
    } catch (err) {
      console.error("Supabase sync exception:", err);
      return {
        success: false,
        error: `Saved locally, but Supabase connection failed.`,
      };
    }
  }

  return { success: true };
}
