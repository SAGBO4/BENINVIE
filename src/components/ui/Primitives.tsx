"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as ShadcnBadge, type BadgeProps } from "@/components/ui/badge";
import { Button as ShadcnButton, type ButtonProps } from "@/components/ui/button";

export function Card({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <ShadcnCard className={className} style={style}>
      {children}
    </ShadcnCard>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  accentColor = "#008751",
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  icon?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg backdrop-blur-sm group hover:border-slate-700 transition"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && <span className="text-xl opacity-80 group-hover:scale-110 transition">{icon}</span>}
      </div>
      <div className="text-2xl font-extrabold text-white my-1.5 tracking-tight">
        {value}
      </div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}

export function Badge({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "benin";
}) {
  const mapVariant: Record<string, BadgeProps["variant"]> = {
    success: "success",
    warning: "warning",
    danger: "destructive",
    info: "default",
    neutral: "secondary",
    benin: "benin",
  };

  return <ShadcnBadge variant={mapVariant[variant] || "default"}>{children}</ShadcnBadge>;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const mapVariant: Record<string, ButtonProps["variant"]> = {
    primary: "default",
    secondary: "secondary",
    danger: "destructive",
    outline: "outline",
  };

  return (
    <ShadcnButton
      onClick={onClick}
      disabled={disabled}
      variant={mapVariant[variant] || "default"}
      className={className}
      style={style}
    >
      {children}
    </ShadcnButton>
  );
}

export { ShadcnCard, ShadcnBadge, ShadcnButton };
