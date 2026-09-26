-- Contenus éditoriaux modifiables depuis l'interface d'administration.
--
-- Les pages légales et les textes institutionnels étaient écrits dans le code:
-- corriger une virgule dans les mentions légales demandait un déploiement.
-- Cette table les sort du code, sans les rendre obligatoires: si une clé est
-- absente, la page retombe sur le texte livré avec l'application.
--
-- À appliquer dans l'éditeur SQL du dashboard Supabase.

CREATE TABLE IF NOT EXISTS site_content (
  key         VARCHAR(64) PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  -- Sous-ensemble Markdown rendu par `src/lib/markdown.ts`: titres, listes,
  -- liens, gras. Le HTML brut n'est jamais interprété.
  body        TEXT NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_site_content_updated_at
  ON site_content (updated_at DESC);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Lecture publique: ces textes sont destinés à être affichés à tout visiteur.
DROP POLICY IF EXISTS "Contenus lisibles par tous" ON site_content;
CREATE POLICY "Contenus lisibles par tous"
  ON site_content FOR SELECT
  USING (true);

-- Écriture réservée au super-administrateur. Les route handlers vérifient déjà
-- le rôle; cette politique empêche une écriture directe par la clé publique.
DROP POLICY IF EXISTS "Super-admin modifie les contenus" ON site_content;
CREATE POLICY "Super-admin modifie les contenus"
  ON site_content FOR ALL
  USING (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  )
  WITH CHECK (
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'super_admin'
  );
