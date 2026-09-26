"use client";

import { motion } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Sparkles, Activity, ShieldAlert, Heart, Droplet } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon?: any;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: "BMM", href: "#hero" },
  { label: "Piliers & Modules", href: "#modules" },
  { label: "Stocks 77 Communes", href: "#stocks" },
  { label: "Urgences Vitales", href: "#urgences" },
  { label: "Espace Donneur", href: "#donneur" },
  { label: "Démo Bio Kalalé", href: "#scenario" },
];

export function BmmNav(): ReactNode {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [activeHref, setActiveHref] = useState("#hero");
  const [pillRect, setPillRect] = useState<{
    x: number;
    width: number;
  } | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);

  const activeIndex = NAV_ITEMS.findIndex((item) => item.href === activeHref);

  useLayoutEffect(() => {
    const list = listRef.current;
    const activeEl = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!list || !activeEl) {
      setPillRect(null);
      return;
    }
    const listRect = list.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    setPillRect({
      x: itemRect.left - listRect.left,
      width: itemRect.width,
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!pillRect) return;
    const id = requestAnimationFrame(() => setHasMeasured(true));
    return () => cancelAnimationFrame(id);
  }, [pillRect]);

  // Observer pour détecter la section active lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const item of NAV_ITEMS) {
        const el = document.querySelector(item.href);
        if (el) {
          const top = (el as HTMLElement).offsetTop;
          const height = (el as HTMLElement).offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveHref(item.href);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      aria-label="Navigation BMM"
      className="fixed left-1/2 top-5 z-50 -translate-x-1/2 max-w-[95vw]"
    >
      <div className="flex items-center gap-1 rounded-full bg-slate-950/80 p-1.5 shadow-2xl border border-slate-800/80 backdrop-blur-xl">
        <ul ref={listRef} className="relative flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
          {pillRect && (
            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{ x: pillRect.x, width: pillRect.width }}
              transition={
                hasMeasured
                  ? { type: "spring", stiffness: 400, damping: 35 }
                  : { duration: 0 }
              }
              style={{ left: 0, top: 0, bottom: 0 }}
              className="absolute rounded-full bg-emerald-600 shadow-md shadow-emerald-950/60"
            />
          )}
          {NAV_ITEMS.map((item, index) => {
            const isActive = item.href === activeHref;
            return (
              <li
                key={item.href}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="relative shrink-0"
              >
                <a
                  href={item.href}
                  onClick={(e) => {
                    setActiveHref(item.href);
                  }}
                  className="relative inline-flex cursor-pointer items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200"
                >
                  <span
                    className={
                      isActive
                        ? "relative z-10 text-white font-bold"
                        : "relative z-10 text-slate-400 hover:text-slate-100"
                    }
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
