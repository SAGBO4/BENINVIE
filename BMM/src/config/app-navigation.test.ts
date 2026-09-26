import { describe, expect, it } from "vitest";

import { navForRole } from "./app-navigation";

const hrefs = (role: Parameters<typeof navForRole>[0]) =>
  navForRole(role).flatMap((group) => group.items.map((item) => item.href));

describe("navForRole", () => {
  it("gives a structure its own screens, without the administration", () => {
    const links = hrefs("org_admin");
    expect(links).toContain("/reseau");
    expect(links).toContain("/cards");
    expect(links).not.toContain("/organisations");
  });

  it("gives the administration its screens", () => {
    const links = hrefs("super_admin");
    expect(links).toContain("/organisations");
    expect(links).toContain("/demandes-cartes");
  });

  it("hides the screens that need a structure from the administration", () => {
    // Le super-admin n'a pas d'organisation: ces deux écrans seraient vides.
    const links = hrefs("super_admin");
    expect(links).not.toContain("/reseau");
    expect(links).not.toContain("/cards");
  });

  it("keeps the network-wide screens for the administration", () => {
    const links = hrefs("super_admin");
    expect(links).toContain("/dashboard");
    expect(links).toContain("/alerts");
    expect(links).toContain("/donors");
  });

  it("falls back to the structure menu for an unknown role", () => {
    expect(hrefs(undefined)).toEqual(hrefs("org_admin"));
  });
});
