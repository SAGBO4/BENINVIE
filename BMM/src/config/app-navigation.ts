import {
  ArrowLeftRight,
  Bell,
  Building2,
  CalendarHeart,
  IdCard,
  LayoutDashboard,
  Search,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type AppRole = "super_admin" | "org_admin" | "donor";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Badge optionnel (ex: nombre d'alertes ouvertes). */
  badge?: string;
};

export type AppNavGroup = {
  title: string;
  items: AppNavItem[];
};

export const appNav: AppNavGroup[] = [
  {
    title: "Pilotage",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { label: "Alertes", href: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Donneurs",
    items: [
      { label: "Annuaire", href: "/donors", icon: Users },
      { label: "Recherche compatible", href: "/search", icon: Search },
    ],
  },
  {
    title: "Mobilisation",
    items: [
      { label: "Campagnes", href: "/campaigns", icon: CalendarHeart },
      { label: "Récompenses", href: "/cards", icon: Zap },
    ],
  },
  {
    title: "Réseau",
    items: [{ label: "Réseau & stock", href: "/reseau", icon: ArrowLeftRight }],
  },
];

/**
 * Menu réservé au super-administrateur : supervision de l'ensemble du réseau,
 * en plus de ce que voit une structure.
 */
export const adminNav: AppNavGroup[] = [
  {
    title: "Administration",
    items: [
      { label: "Organisations", href: "/organisations", icon: Building2 },
      { label: "Demandes de cartes", href: "/demandes-cartes", icon: IdCard },
    ],
  },
];

/**
 * Menu adapté au rôle.
 *
 * Le super-administrateur ne voit pas « Réseau & stock » ni « Récompenses »:
 * ces deux écrans sont rattachés à une structure, et l'administration n'en a
 * pas. Les lui proposer menait à des pages nécessairement vides.
 */
const ORG_ONLY_HREFS = new Set(["/reseau", "/cards"]);

export function navForRole(role: AppRole | undefined): AppNavGroup[] {
  if (role !== "super_admin") return appNav;

  const networkWide = appNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !ORG_ONLY_HREFS.has(item.href)),
    }))
    .filter((group) => group.items.length > 0);

  return [...networkWide, ...adminNav];
}
