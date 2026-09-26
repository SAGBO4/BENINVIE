"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_PORTFOLIO_DATA, PortfolioData } from "./portfolio-data";

type PortfolioContextType = {
  data: PortfolioData;
  loading: boolean;
  refresh: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioContextType>({
  data: DEFAULT_PORTFOLIO_DATA,
  loading: false,
  refresh: async () => {},
});

export function PortfolioProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: PortfolioData;
}): ReactNode {
  const [data, setData] = useState<PortfolioData>(initialData ?? DEFAULT_PORTFOLIO_DATA);
  const [loading, setLoading] = useState(false);

  const fetchLatest = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.profile) {
          setData(json);
        }
      }
    } catch (e) {
      console.warn("Could not fetch latest portfolio content:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLatest();
  }, []);

  return (
    <PortfolioContext.Provider value={{ data, loading, refresh: fetchLatest }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextType {
  return useContext(PortfolioContext);
}
