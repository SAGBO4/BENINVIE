export type PoleDeveloppementId =
  | "grand-nokoue"
  | "sud-ouest"
  | "sud-est"
  | "centre"
  | "nord-ouest"
  | "nord-est";

export interface PoleDeveloppement {
  id: PoleDeveloppementId;
  nom: string;
  description: string;
  couleur: string;
  chefLieu: string;
  villesPrincipales: string[];
  communes: string[];
  lat: number;
  lng: number;
  zoom: number;
}

export interface Commune {
  nom: string;
  departement: string;
  zoneAgroecologique: string;
  lat: number;
  lng: number;
  pole: string;
  poleId: PoleDeveloppementId;
}

export const DEPARTEMENTS = [
  "Alibori",
  "Atacora",
  "Atlantique",
  "Borgou",
  "Collines",
  "Couffo",
  "Donga",
  "Littoral",
  "Mono",
  "Oueme",
  "Plateau",
  "Zou",
] as const;

/**
 * Référentiel Officiel des 06 Pôles de Développement Territorial du Bénin
 * Source : Schéma National d'Aménagement du Territoire (SNAT) & Réforme Territoriale 229 DEGRÉ
 */
export const POLES_DEVELOPPEMENT_BENIN: PoleDeveloppement[] = [
  {
    id: "grand-nokoue",
    nom: "Pôle Grand-Nokoué",
    description: "Métropole économique, diplomatique et hospitalière de référence (CHIC Calavi, CNHU-HKM, CHD Ouémé)",
    couleur: "#10b981", // Émeraude
    chefLieu: "Cotonou / Porto-Novo",
    villesPrincipales: ["Cotonou", "Abomey-Calavi", "Porto-Novo", "Ouidah", "Sèmè-Kpodji"],
    communes: ["Abomey-Calavi", "Cotonou", "Ouidah", "Porto-Novo", "Sèmè-Kpodji"],
    lat: 6.42,
    lng: 2.45,
    zoom: 11,
  },
  {
    id: "sud-ouest",
    nom: "Pôle Sud-Ouest",
    description: "Corridor littoral et agro-industriel Mono-Couffo-Atlantique Sud (Hôpitaux de zone Lokossa, Comè, Aplahoué)",
    couleur: "#0284c7", // Bleu Océan
    chefLieu: "Lokossa",
    villesPrincipales: ["Lokossa", "Allada", "Aplahoué", "Comè", "Grand-Popo", "Ouidah"],
    communes: [
      "Lokossa",
      "Allada",
      "Aplahoué",
      "Athiémé",
      "Bopa",
      "Comè",
      "Djakotomey",
      "Dogbo",
      "Grand-Popo",
      "Houéyogbé",
      "Klouékanmè",
      "Kpomassè",
      "Lalo",
      "Sô-Ava",
      "Toffo",
      "Tori-Bossito",
      "Toviklin",
      "Zè",
    ],
    lat: 6.65,
    lng: 1.95,
    zoom: 9,
  },
  {
    id: "sud-est",
    nom: "Pôle Sud-Est",
    description: "Bassin frontalier et agro-forestier Ouémé-Plateau (Hôpitaux de zone Sakété, Pobè, Kétou)",
    couleur: "#2563eb", // Bleu Roi
    chefLieu: "Pobè",
    villesPrincipales: ["Pobè", "Sakété", "Kétou", "Dangbo", "Adjohoun"],
    communes: [
      "Pobè",
      "Adja-Ouèrè",
      "Adjarra",
      "Adjohoun",
      "Aguégués",
      "Akpro-Missérété",
      "Avrankou",
      "Bonou",
      "Dangbo",
      "Ifangni",
      "Kétou",
      "Sakété",
    ],
    lat: 6.85,
    lng: 2.60,
    zoom: 9,
  },
  {
    id: "centre",
    nom: "Pôle Centre",
    description: "Carrefour logistique, historique et agro-pastoral Zou-Collines (CHD Zou-Collines, Hôpitaux Dassa, Savalou)",
    couleur: "#06b6d4", // Cyan
    chefLieu: "Abomey / Bohicon",
    villesPrincipales: ["Abomey", "Bohicon", "Dassa-Zoumè", "Savalou", "Savè"],
    communes: [
      "Abomey",
      "Agbangnizoun",
      "Bantè",
      "Bohicon",
      "Covè",
      "Dassa-Zoumè",
      "Djidja",
      "Glazoué",
      "Ouèssè",
      "Ouinhi",
      "Savalou",
      "Savè",
      "Za-Kpota",
      "Zagnanado",
      "Zogbodomey",
    ],
    lat: 7.55,
    lng: 2.15,
    zoom: 8,
  },
  {
    id: "nord-ouest",
    nom: "Pôle Nord-Ouest",
    description: "Massif de l'Atacora et corridor Donga-Togo (CHD Atacora Natitingou, Hôpitaux Djougou, Tanguiéta)",
    couleur: "#38bdf8", // Bleu Ciel
    chefLieu: "Natitingou / Djougou",
    villesPrincipales: ["Natitingou", "Djougou", "Tanguieta", "Bassila", "Kouande"],
    communes: [
      "Natitingou",
      "Bassila",
      "Boukoumbe",
      "Cobly",
      "Copargo",
      "Djougou",
      "Kerou",
      "Kouande",
      "Matéri",
      "Ouaké",
      "Pehunco",
      "Tanguieta",
      "Toucountouna",
    ],
    lat: 9.95,
    lng: 1.65,
    zoom: 8,
  },
  {
    id: "nord-est",
    nom: "Pôle Nord-Est",
    description: "Pôle septentrional et frontalier Borgou-Alibori (CHUD Borgou Parakou, Hôpitaux Nikki, Kandi, Malanville)",
    couleur: "#1e3a8a", // Bleu Nuit
    chefLieu: "Parakou",
    villesPrincipales: ["Parakou", "Kandi", "Nikki", "Malanville", "Bembèrèkè", "Banikoara"],
    communes: [
      "Parakou",
      "Banikoara",
      "Bembèrèkè",
      "Gogounou",
      "Kalalé",
      "Kandi",
      "Karimama",
      "Malanville",
      "N'Dali",
      "Nikki",
      "Pèrèrè",
      "Segbana",
      "Sinendé",
      "Tchaourou",
    ],
    lat: 10.45,
    lng: 2.85,
    zoom: 8,
  },
];

/**
 * 77 Communes du Bénin ordonnées et indexées avec leur Pôle Territorial Officiel
 */
export const COMMUNES_BENIN: Commune[] = [
  // Alibori -> Pôle Nord-Est
  { nom: "Banikoara", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 11.2985, lng: 2.4386, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Gogounou", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 10.8384, lng: 2.8344, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Kandi", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 11.1342, lng: 2.9386, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Karimama", departement: "Alibori", zoneAgroecologique: "Vallee du Niger", lat: 12.0667, lng: 3.1833, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Malanville", departement: "Alibori", zoneAgroecologique: "Vallee du Niger", lat: 11.8692, lng: 3.3833, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Segbana", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 10.9275, lng: 3.6931, pole: "Pôle Nord-Est", poleId: "nord-est" },

  // Atacora -> Pôle Nord-Ouest
  { nom: "Boukoumbe", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.1775, lng: 1.1067, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Cobly", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.4578, lng: 1.4542, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Kerou", departement: "Atacora", zoneAgroecologique: "Zone soudanienne nord", lat: 10.8406, lng: 2.1086, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Kouande", departement: "Atacora", zoneAgroecologique: "Zone soudanienne nord", lat: 10.3314, lng: 1.6906, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Matéri", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.7444, lng: 1.2961, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Natitingou", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.3042, lng: 1.3797, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Pehunco", departement: "Atacora", zoneAgroecologique: "Zone vivriere du Nord", lat: 10.2289, lng: 1.9961, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Tanguieta", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.6214, lng: 1.2656, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Toucountouna", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.4789, lng: 1.3325, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },

  // Atlantique -> Grand-Nokoué (Abomey-Calavi, Ouidah) & Sud-Ouest (Allada, Kpomassè, Sô-Ava, Toffo, Tori-Bossito, Zè)
  { nom: "Abomey-Calavi", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.4486, lng: 2.3556, pole: "Pôle Grand-Nokoué", poleId: "grand-nokoue" },
  { nom: "Allada", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.6653, lng: 2.1514, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Kpomassè", departement: "Atlantique", zoneAgroecologique: "Zone cotiere et lacs", lat: 6.4889, lng: 2.0406, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Ouidah", departement: "Atlantique", zoneAgroecologique: "Cordon littoral", lat: 6.3631, lng: 2.0850, pole: "Pôle Grand-Nokoué", poleId: "grand-nokoue" },
  { nom: "Sô-Ava", departement: "Atlantique", zoneAgroecologique: "Zone lacustre Nokoue", lat: 6.4583, lng: 2.4167, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Toffo", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.8447, lng: 2.0811, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Tori-Bossito", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.5028, lng: 2.1389, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Zè", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.6028, lng: 2.2778, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },

  // Borgou -> Pôle Nord-Est
  { nom: "Bembèrèkè", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 10.2283, lng: 2.6633, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Kalalé", departement: "Borgou", zoneAgroecologique: "Zone agropastorale du Borgou", lat: 10.2889, lng: 3.3764, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "N'Dali", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.8608, lng: 2.7189, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Nikki", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.9400, lng: 3.2108, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Parakou", departement: "Borgou", zoneAgroecologique: "Centre urbain et vivrier", lat: 9.3372, lng: 2.6303, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Pèrèrè", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.6000, lng: 3.0167, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Sinendé", departement: "Borgou", zoneAgroecologique: "Zone agropastorale du Borgou", lat: 10.3333, lng: 2.3833, pole: "Pôle Nord-Est", poleId: "nord-est" },
  { nom: "Tchaourou", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 8.8864, lng: 2.5975, pole: "Pôle Nord-Est", poleId: "nord-est" },

  // Collines -> Pôle Centre
  { nom: "Bantè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 8.4167, lng: 1.8833, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Dassa-Zoumè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.7500, lng: 2.1833, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Glazoué", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.9667, lng: 2.2333, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Ouèssè", departement: "Collines", zoneAgroecologique: "Zone vivriere des collines", lat: 8.4833, lng: 2.4167, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Savalou", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.9333, lng: 1.9667, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Savè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 8.0333, lng: 2.4833, pole: "Pôle Centre", poleId: "centre" },

  // Couffo -> Pôle Sud-Ouest
  { nom: "Aplahoué", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9333, lng: 1.6833, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Djakotomey", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9000, lng: 1.7167, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Dogbo", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.8000, lng: 1.7833, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Klouékanmè", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 7.0000, lng: 1.8500, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Lalo", departement: "Couffo", zoneAgroecologique: "Depression de la Lama", lat: 6.9167, lng: 1.9000, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Toviklin", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9667, lng: 1.8000, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },

  // Donga -> Pôle Nord-Ouest
  { nom: "Bassila", departement: "Donga", zoneAgroecologique: "Foret clairiere de la Donga", lat: 9.0167, lng: 1.6667, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Copargo", departement: "Donga", zoneAgroecologique: "Chaine de l'Atacora sud", lat: 9.8333, lng: 1.5500, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Djougou", departement: "Donga", zoneAgroecologique: "Bassin de la Kara et Donga", lat: 9.7085, lng: 1.6660, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },
  { nom: "Ouaké", departement: "Donga", zoneAgroecologique: "Zone soudano-guineenne", lat: 9.6667, lng: 1.3833, pole: "Pôle Nord-Ouest", poleId: "nord-ouest" },

  // Littoral -> Pôle Grand-Nokoué
  { nom: "Cotonou", departement: "Littoral", zoneAgroecologique: "Zone urbaine littorale", lat: 6.3703, lng: 2.4183, pole: "Pôle Grand-Nokoué", poleId: "grand-nokoue" },

  // Mono -> Pôle Sud-Ouest
  { nom: "Athiémé", departement: "Mono", zoneAgroecologique: "Vallee du Mono", lat: 6.6667, lng: 1.6667, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Bopa", departement: "Mono", zoneAgroecologique: "Lac Aheme et environs", lat: 6.6667, lng: 1.9333, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Comè", departement: "Mono", zoneAgroecologique: "Cordon littoral et lacs", lat: 6.4000, lng: 1.8833, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Grand-Popo", departement: "Mono", zoneAgroecologique: "Cordon littoral marin", lat: 6.2833, lng: 1.8333, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Houéyogbé", departement: "Mono", zoneAgroecologique: "Plateau et depressions", lat: 6.5333, lng: 1.8667, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },
  { nom: "Lokossa", departement: "Mono", zoneAgroecologique: "Vallee du Mono", lat: 6.6389, lng: 1.7167, pole: "Pôle Sud-Ouest", poleId: "sud-ouest" },

  // Oueme -> Grand-Nokoué (Porto-Novo, Sèmè-Kpodji) & Sud-Est (Adjarra, Adjohoun, Aguégués, Akpro-Missérété, Avrankou, Bonou, Dangbo)
  { nom: "Adjarra", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5333, lng: 2.6667, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Adjohoun", departement: "Oueme", zoneAgroecologique: "Basse vallee de l'Oueme", lat: 6.7000, lng: 2.5000, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Aguégués", departement: "Oueme", zoneAgroecologique: "Zone lacustre delta Oueme", lat: 6.4833, lng: 2.5167, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Akpro-Missérété", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5667, lng: 2.5833, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Avrankou", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5500, lng: 2.6500, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Bonou", departement: "Oueme", zoneAgroecologique: "Moyenne vallee de l'Oueme", lat: 6.9000, lng: 2.4500, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Dangbo", departement: "Oueme", zoneAgroecologique: "Basse vallee de l'Oueme", lat: 6.5833, lng: 2.5500, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Porto-Novo", departement: "Oueme", zoneAgroecologique: "Capitale et plateaux", lat: 6.4969, lng: 2.6289, pole: "Pôle Grand-Nokoué", poleId: "grand-nokoue" },
  { nom: "Sèmè-Kpodji", departement: "Oueme", zoneAgroecologique: "Cordon littoral est", lat: 6.3667, lng: 2.6167, pole: "Pôle Grand-Nokoué", poleId: "grand-nokoue" },

  // Plateau -> Pôle Sud-Est
  { nom: "Adja-Ouèrè", departement: "Plateau", zoneAgroecologique: "Plateau de Sakete-Pobe", lat: 7.0000, lng: 2.6167, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Ifangni", departement: "Plateau", zoneAgroecologique: "Plateau frontalier est", lat: 6.6667, lng: 2.7167, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Kétou", departement: "Plateau", zoneAgroecologique: "Zone agropastorale du Plateau", lat: 7.3633, lng: 2.6000, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Pobè", departement: "Plateau", zoneAgroecologique: "Bassin du palmier a huile", lat: 6.9800, lng: 2.6647, pole: "Pôle Sud-Est", poleId: "sud-est" },
  { nom: "Sakété", departement: "Plateau", zoneAgroecologique: "Plateau de Sakete", lat: 6.7361, lng: 2.6583, pole: "Pôle Sud-Est", poleId: "sud-est" },

  // Zou -> Pôle Centre
  { nom: "Abomey", departement: "Zou", zoneAgroecologique: "Plateau historique d'Abomey", lat: 7.1828, lng: 1.9911, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Agbangnizoun", departement: "Zou", zoneAgroecologique: "Plateau d'Abomey", lat: 7.0833, lng: 2.0167, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Bohicon", departement: "Zou", zoneAgroecologique: "Carrefour commercial Zou", lat: 7.1783, lng: 2.0667, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Covè", departement: "Zou", zoneAgroecologique: "Depression de la Lama nord", lat: 7.2167, lng: 2.3333, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Djidja", departement: "Zou", zoneAgroecologique: "Zone agropastorale du Zou", lat: 7.3431, lng: 1.9367, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Ouinhi", departement: "Zou", zoneAgroecologique: "Vallee de l'Oueme ouest", lat: 7.0333, lng: 2.4500, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Za-Kpota", departement: "Zou", zoneAgroecologique: "Plateau du Zou central", lat: 7.2333, lng: 2.2167, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Zagnanado", departement: "Zou", zoneAgroecologique: "Zone forestiere du Zou", lat: 7.2667, lng: 2.3833, pole: "Pôle Centre", poleId: "centre" },
  { nom: "Zogbodomey", departement: "Zou", zoneAgroecologique: "Depression de la Lama", lat: 7.0833, lng: 2.1000, pole: "Pôle Centre", poleId: "centre" },
];

/**
 * Fonctions utilitaires de découpage territorial
 */
export function getPoleById(id: string): PoleDeveloppement | undefined {
  return POLES_DEVELOPPEMENT_BENIN.find((p) => p.id === id);
}

export function getPoleByName(name: string): PoleDeveloppement | undefined {
  const norm = name.toLowerCase().trim();
  return POLES_DEVELOPPEMENT_BENIN.find(
    (p) => p.nom.toLowerCase() === norm || p.id === norm || p.nom.toLowerCase().includes(norm)
  );
}

export function getPoleForCommune(communeNom: string): PoleDeveloppement {
  const norm = communeNom.toLowerCase().trim();
  // Chercher dans les communes officielles du pôle
  for (const pole of POLES_DEVELOPPEMENT_BENIN) {
    if (pole.communes.some((c) => c.toLowerCase() === norm || norm.includes(c.toLowerCase()))) {
      return pole;
    }
  }
  // Fallback si introuvable par commune directe
  const commune = COMMUNES_BENIN.find(
    (c) => c.nom.toLowerCase() === norm || norm.includes(c.nom.toLowerCase())
  );
  if (commune) {
    return getPoleById(commune.poleId) || POLES_DEVELOPPEMENT_BENIN[0];
  }
  return POLES_DEVELOPPEMENT_BENIN[0];
}

export function getCommunesByPole(poleIdOrNom: string): Commune[] {
  const norm = poleIdOrNom.toLowerCase().trim();
  const pole = POLES_DEVELOPPEMENT_BENIN.find(
    (p) => p.id === norm || p.nom.toLowerCase() === norm || p.nom.toLowerCase().includes(norm)
  );
  if (!pole) return [];
  return COMMUNES_BENIN.filter((c) => c.poleId === pole.id);
}
