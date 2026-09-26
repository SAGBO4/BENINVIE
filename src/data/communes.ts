export interface Commune {
  nom: string;
  departement: string;
  zoneAgroecologique: string;
  lat: number;
  lng: number;
  pole: string;
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

export const COMMUNES_BENIN: Commune[] = [
  // Alibori
  { nom: "Banikoara", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 11.2985, lng: 2.4386, pole: "Pole 2" },
  { nom: "Gogounou", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 10.8384, lng: 2.8344, pole: "Pole 2" },
  { nom: "Kandi", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 11.1342, lng: 2.9386, pole: "Pole 2" },
  { nom: "Karimama", departement: "Alibori", zoneAgroecologique: "Vallee du Niger", lat: 12.0667, lng: 3.1833, pole: "Pole 1" },
  { nom: "Malanville", departement: "Alibori", zoneAgroecologique: "Vallee du Niger", lat: 11.8692, lng: 3.3833, pole: "Pole 1" },
  { nom: "Segbana", departement: "Alibori", zoneAgroecologique: "Bassin cotonnier du Nord", lat: 10.9275, lng: 3.6931, pole: "Pole 2" },

  // Atacora
  { nom: "Boukoumbe", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.1775, lng: 1.1067, pole: "Pole 3" },
  { nom: "Cobly", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.4578, lng: 1.4542, pole: "Pole 3" },
  { nom: "Kerou", departement: "Atacora", zoneAgroecologique: "Zone soudanienne nord", lat: 10.8406, lng: 2.1086, pole: "Pole 3" },
  { nom: "Kouande", departement: "Atacora", zoneAgroecologique: "Zone soudanienne nord", lat: 10.3314, lng: 1.6906, pole: "Pole 3" },
  { nom: "Matéri", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.7444, lng: 1.2961, pole: "Pole 3" },
  { nom: "Natitingou", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.3042, lng: 1.3797, pole: "Pole 3" },
  { nom: "Pehunco", departement: "Atacora", zoneAgroecologique: "Zone vivriere du Nord", lat: 10.2289, lng: 1.9961, pole: "Pole 3" },
  { nom: "Tanguieta", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.6214, lng: 1.2656, pole: "Pole 3" },
  { nom: "Toucountouna", departement: "Atacora", zoneAgroecologique: "Chaine de l'Atacora", lat: 10.4789, lng: 1.3325, pole: "Pole 3" },

  // Atlantique
  { nom: "Abomey-Calavi", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.4486, lng: 2.3556, pole: "Pole 7" },
  { nom: "Allada", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.6653, lng: 2.1514, pole: "Pole 7" },
  { nom: "Kpomassè", departement: "Atlantique", zoneAgroecologique: "Zone cotiere et lacs", lat: 6.4889, lng: 2.0406, pole: "Pole 7" },
  { nom: "Ouidah", departement: "Atlantique", zoneAgroecologique: "Cordon littoral", lat: 6.3631, lng: 2.0850, pole: "Pole 7" },
  { nom: "Sô-Ava", departement: "Atlantique", zoneAgroecologique: "Zone lacustre Nokoue", lat: 6.4583, lng: 2.4167, pole: "Pole 7" },
  { nom: "Toffo", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.8447, lng: 2.0811, pole: "Pole 7" },
  { nom: "Tori-Bossito", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.5028, lng: 2.1389, pole: "Pole 7" },
  { nom: "Zè", departement: "Atlantique", zoneAgroecologique: "Terre de barre et plateaux", lat: 6.6028, lng: 2.2778, pole: "Pole 7" },

  // Borgou
  { nom: "Bembèrèkè", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 10.2283, lng: 2.6633, pole: "Pole 4" },
  { nom: "Kalalé", departement: "Borgou", zoneAgroecologique: "Zone agropastorale du Borgou", lat: 10.2889, lng: 3.3764, pole: "Pole 4" },
  { nom: "N'Dali", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.8608, lng: 2.7189, pole: "Pole 4" },
  { nom: "Nikki", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.9400, lng: 3.2108, pole: "Pole 4" },
  { nom: "Parakou", departement: "Borgou", zoneAgroecologique: "Centre urbain et vivrier", lat: 9.3372, lng: 2.6303, pole: "Pole 4" },
  { nom: "Pèrèrè", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 9.6000, lng: 3.0167, pole: "Pole 4" },
  { nom: "Sinendé", departement: "Borgou", zoneAgroecologique: "Zone agropastorale du Borgou", lat: 10.3333, lng: 2.3833, pole: "Pole 4" },
  { nom: "Tchaourou", departement: "Borgou", zoneAgroecologique: "Zone vivriere et cotoniere", lat: 8.8864, lng: 2.5975, pole: "Pole 4" },

  // Collines
  { nom: "Bantè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 8.4167, lng: 1.8833, pole: "Pole 5" },
  { nom: "Dassa-Zoumè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.7500, lng: 2.1833, pole: "Pole 5" },
  { nom: "Glazoué", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.9667, lng: 2.2333, pole: "Pole 5" },
  { nom: "Ouèssè", departement: "Collines", zoneAgroecologique: "Zone vivriere des collines", lat: 8.4833, lng: 2.4167, pole: "Pole 5" },
  { nom: "Savalou", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 7.9333, lng: 1.9667, pole: "Pole 5" },
  { nom: "Savè", departement: "Collines", zoneAgroecologique: "Zone des collines", lat: 8.0333, lng: 2.4833, pole: "Pole 5" },

  // Couffo
  { nom: "Aplahoué", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9333, lng: 1.6833, pole: "Pole 6" },
  { nom: "Djakotomey", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9000, lng: 1.7167, pole: "Pole 6" },
  { nom: "Dogbo", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.8000, lng: 1.7833, pole: "Pole 6" },
  { nom: "Klouékanmè", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 7.0000, lng: 1.8500, pole: "Pole 6" },
  { nom: "Lalo", departement: "Couffo", zoneAgroecologique: "Depression de la Lama", lat: 6.9167, lng: 1.9000, pole: "Pole 6" },
  { nom: "Toviklin", departement: "Couffo", zoneAgroecologique: "Plateau Adja", lat: 6.9667, lng: 1.8000, pole: "Pole 6" },

  // Donga
  { nom: "Bassila", departement: "Donga", zoneAgroecologique: "Foret clairiere de la Donga", lat: 9.0167, lng: 1.6667, pole: "Pole 4" },
  { nom: "Copargo", departement: "Donga", zoneAgroecologique: "Chaine de l'Atacora sud", lat: 9.8333, lng: 1.5500, pole: "Pole 4" },
  { nom: "Djougou", departement: "Donga", zoneAgroecologique: "Bassin de la Kara et Donga", lat: 9.7085, lng: 1.6660, pole: "Pole 4" },
  { nom: "Ouaké", departement: "Donga", zoneAgroecologique: "Zone soudano-guineenne", lat: 9.6667, lng: 1.3833, pole: "Pole 4" },

  // Littoral
  { nom: "Cotonou", departement: "Littoral", zoneAgroecologique: "Zone urbaine littorale", lat: 6.3703, lng: 2.4183, pole: "Pole 7" },

  // Mono
  { nom: "Athiémé", departement: "Mono", zoneAgroecologique: "Vallee du Mono", lat: 6.6667, lng: 1.6667, pole: "Pole 6" },
  { nom: "Bopa", departement: "Mono", zoneAgroecologique: "Lac Aheme et environs", lat: 6.6667, lng: 1.9333, pole: "Pole 6" },
  { nom: "Comè", departement: "Mono", zoneAgroecologique: "Cordon littoral et lacs", lat: 6.4000, lng: 1.8833, pole: "Pole 6" },
  { nom: "Grand-Popo", departement: "Mono", zoneAgroecologique: "Cordon littoral marin", lat: 6.2833, lng: 1.8333, pole: "Pole 6" },
  { nom: "Houéyogbé", departement: "Mono", zoneAgroecologique: "Plateau et depressions", lat: 6.5333, lng: 1.8667, pole: "Pole 6" },
  { nom: "Lokossa", departement: "Mono", zoneAgroecologique: "Vallee du Mono", lat: 6.6389, lng: 1.7167, pole: "Pole 6" },

  // Oueme
  { nom: "Adjarra", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5333, lng: 2.6667, pole: "Pole 7" },
  { nom: "Adjohoun", departement: "Oueme", zoneAgroecologique: "Basse vallee de l'Oueme", lat: 6.7000, lng: 2.5000, pole: "Pole 7" },
  { nom: "Aguégués", departement: "Oueme", zoneAgroecologique: "Zone lacustre delta Oueme", lat: 6.4833, lng: 2.5167, pole: "Pole 7" },
  { nom: "Akpro-Missérété", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5667, lng: 2.5833, pole: "Pole 7" },
  { nom: "Avrankou", departement: "Oueme", zoneAgroecologique: "Plateau de Porto-Novo", lat: 6.5500, lng: 2.6500, pole: "Pole 7" },
  { nom: "Bonou", departement: "Oueme", zoneAgroecologique: "Moyenne vallee de l'Oueme", lat: 6.9000, lng: 2.4500, pole: "Pole 7" },
  { nom: "Dangbo", departement: "Oueme", zoneAgroecologique: "Basse vallee de l'Oueme", lat: 6.5833, lng: 2.5500, pole: "Pole 7" },
  { nom: "Porto-Novo", departement: "Oueme", zoneAgroecologique: "Capitale et plateaux", lat: 6.4969, lng: 2.6289, pole: "Pole 7" },
  { nom: "Sèmè-Kpodji", departement: "Oueme", zoneAgroecologique: "Cordon littoral est", lat: 6.3667, lng: 2.6167, pole: "Pole 7" },

  // Plateau
  { nom: "Adja-Ouèrè", departement: "Plateau", zoneAgroecologique: "Plateau de Sakete-Pobe", lat: 7.0000, lng: 2.6167, pole: "Pole 7" },
  { nom: "Ifangni", departement: "Plateau", zoneAgroecologique: "Plateau frontalier est", lat: 6.6667, lng: 2.7167, pole: "Pole 7" },
  { nom: "Kétou", departement: "Plateau", zoneAgroecologique: "Zone agropastorale du Plateau", lat: 7.3633, lng: 2.6000, pole: "Pole 7" },
  { nom: "Pobè", departement: "Plateau", zoneAgroecologique: "Bassin du palmier a huile", lat: 6.9800, lng: 2.6647, pole: "Pole 7" },
  { nom: "Sakété", departement: "Plateau", zoneAgroecologique: "Plateau de Sakete", lat: 6.7361, lng: 2.6583, pole: "Pole 7" },

  // Zou
  { nom: "Abomey", departement: "Zou", zoneAgroecologique: "Plateau historique d'Abomey", lat: 7.1828, lng: 1.9911, pole: "Pole 5" },
  { nom: "Agbangnizoun", departement: "Zou", zoneAgroecologique: "Plateau d'Abomey", lat: 7.0833, lng: 2.0167, pole: "Pole 5" },
  { nom: "Bohicon", departement: "Zou", zoneAgroecologique: "Carrefour commercial Zou", lat: 7.1783, lng: 2.0667, pole: "Pole 5" },
  { nom: "Covè", departement: "Zou", zoneAgroecologique: "Depression de la Lama nord", lat: 7.2167, lng: 2.3333, pole: "Pole 5" },
  { nom: "Djidja", departement: "Zou", zoneAgroecologique: "Zone agropastorale du Zou", lat: 7.3431, lng: 1.9367, pole: "Pole 5" },
  { nom: "Ouinhi", departement: "Zou", zoneAgroecologique: "Vallee de l'Oueme ouest", lat: 7.0333, lng: 2.4500, pole: "Pole 5" },
  { nom: "Za-Kpota", departement: "Zou", zoneAgroecologique: "Plateau du Zou central", lat: 7.2333, lng: 2.2167, pole: "Pole 5" },
  { nom: "Zagnanado", departement: "Zou", zoneAgroecologique: "Zone forestiere du Zou", lat: 7.2667, lng: 2.3833, pole: "Pole 5" },
  { nom: "Zogbodomey", departement: "Zou", zoneAgroecologique: "Depression de la Lama", lat: 7.0833, lng: 2.1000, pole: "Pole 5" },
];
