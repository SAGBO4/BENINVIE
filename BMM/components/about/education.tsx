"use client";

import { usePortfolio } from "@/lib/portfolio-context";
import type { ReactNode } from "react";

type Entry = {
  school: string;
  degree: string;
  period: string;
  tag: string;
  brand: string;
};

const ENTRIES: Entry[] = [
  {
    school: "Web3 Community Leadership",
    degree: "Community Management & Ecosystem Strategy",
    period: "2020 – Present",
    tag: "W3",
    brand: "#7A5AF8",
  },
  {
    school: "Customer Operations & CRM",
    degree: "User Feedback Analysis & Technical Escalation",
    period: "2022 – Present",
    tag: "CRM",
    brand: "#00B4D8",
  },
  {
    school: "Growth & KOL Marketing",
    degree: "AMAs, Competitions & Airdrop Campaigns",
    period: "2021 – Present",
    tag: "KOL",
    brand: "#12B76A",
  },
  {
    school: "Language Proficiency",
    degree: "French (Native) • English (Fluent)",
    period: "Bilingual",
    tag: "LANG",
    brand: "#F04438",
  },
];

export function Education(): ReactNode {
  const { data } = usePortfolio();
  const entries = data.education && data.education.length > 0 ? data.education : ENTRIES;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-foreground text-[15px] font-semibold tracking-tight">
        Expertise & Education
      </h3>
      <div className="border-foreground/5 bg-foreground/2 dark:bg-foreground/5 relative rounded-4xl border p-2 sm:p-4">
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li
              key={`${entry.school}-${entry.period}`}
              className="bg-background border-foreground/5 flex items-center gap-3.5 rounded-3xl border p-3 sm:p-3.5"
            >
              <SchoolLogo entry={entry} />
              <div className="flex min-w-0 flex-col">
                <span className="text-foreground text-[16px] font-semibold tracking-tight sm:text-[17px]">
                  {entry.school}
                </span>
                <span className="text-foreground/65 mt-0.5 text-[13.5px] tracking-tight sm:text-[14px]">
                  {entry.degree}
                  <span className="text-foreground/30 mx-2">•</span>
                  <span className="text-foreground/55 font-medium">{entry.period}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SchoolLogo({ entry }: { entry: Entry }): ReactNode {
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-white text-[12px] font-bold tracking-tight shadow-xs"
      aria-hidden="true"
      style={{ borderRadius: 14, backgroundColor: entry.brand }}
    >
      {entry.tag}
    </span>
  );
}
