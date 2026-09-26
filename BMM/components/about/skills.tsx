"use client";

import { usePortfolio } from "@/lib/portfolio-context";
import type { ReactNode } from "react";

const DEFAULT_SKILLS = [
  "Community Management",
  "Social Media Strategy",
  "Web3 & Crypto Ecosystem",
  "Telegram & Discord Moderation",
  "KOL Partnerships & Outreach",
  "AMA Hosting & Organization",
  "Customer Support & Ticketing",
  "Growth Marketing & Airdrops",
  "Bot Automation & Moderation",
  "Feedback Analysis & Escalation",
  "Anti-Spam & Fraud Prevention",
  "English (Fluent) & French (Native)",
];

export function Skills(): ReactNode {
  const { data } = usePortfolio();
  const skills = data.skills && data.skills.length > 0 ? data.skills : DEFAULT_SKILLS;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
        What I do
      </h3>
      <div className="rounded-4xl border border-foreground/5 bg-foreground/2 p-2 sm:p-4 dark:bg-foreground/5">
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-foreground/8 bg-background px-4 py-2 text-[14px] tracking-tight text-foreground/85 sm:text-[15px]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
