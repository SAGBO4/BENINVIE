"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Liste déroulante, bâtie sur le `<select>` du navigateur.
 *
 * Une version fondée sur Radix a été retirée: son contenu n'est monté qu'une
 * fois la liste ouverte, si bien qu'un champ contrôlé restait sur son texte
 * d'invite et que le composant émettait un changement à vide au montage.
 * Concrètement, un formulaire restauré perdait le groupe sanguin déjà choisi.
 *
 * Le champ natif règle cela et apporte le reste: sélecteur du système sur
 * téléphone, navigation au clavier sans code, fonctionnement sans JavaScript,
 * et restauration triviale par le navigateur lui-même.
 */
type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Option affichée tant que rien n'est choisi. */
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  children: ReactNode;
};

export function Select({
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  placeholder,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        name={name}
        required={required}
        disabled={disabled}
        aria-label={props["aria-label"]}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn(
          "border-input bg-background h-10 w-full cursor-pointer appearance-none rounded-md border py-2 pr-9 pl-3 text-sm shadow-sm transition-colors",
          "hover:border-ring/60 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>

      <ChevronDown
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      />
    </div>
  );
}

export function SelectItem({ children, ...props }: ComponentProps<"option">) {
  return <option {...props}>{children}</option>;
}
