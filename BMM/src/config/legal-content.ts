/**
 * Textes légaux livrés avec l'application.
 *
 * Ils servent de repli: si la base ne contient pas encore la clé, ou si elle
 * est injoignable, la page affiche cette version plutôt qu'un écran vide. Une
 * page légale qui disparaît parce qu'une requête a échoué est un problème
 * juridique, pas seulement un problème d'affichage.
 *
 * Dès qu'un administrateur enregistre le texte depuis la console, c'est la
 * version en base qui prime.
 */

export type LegalKey = "mentions-legales" | "confidentialite" | "conditions";

export type LegalDocument = {
  key: LegalKey;
  title: string;
  /** Markdown restreint: titres `##`, listes `-`, gras, liens. */
  body: string;
};

export const LEGAL_DOCUMENTS: Record<LegalKey, LegalDocument> = {
  "mentions-legales": {
    key: "mentions-legales",
    title: "Mentions légales",
    body: `## Éditeur de la plateforme

HEMORA est une plateforme de mise en relation entre donneurs de sang et structures de santé. Pour toute demande, un contact est mis à disposition via la page de soutien et l'adresse e-mail de l'équipe.

## Hébergement

La plateforme est hébergée sur une infrastructure d'hébergement web professionnelle. Les données de santé font l'objet de mesures de protection renforcées, dans un cadre conforme à la réglementation applicable.

## Nature du service

HEMORA ne se substitue pas aux structures de santé agréées. La qualification biologique du sang, les tests de groupe sanguin et les décisions médicales relèvent exclusivement des centres de transfusion et des professionnels de santé compétents. Le groupe sanguin renseigné par un donneur reste déclaratif tant qu'il n'a pas été confirmé par un centre agréé.

## Autorités de référence

L'activité de collecte et de transfusion sanguine au Bénin relève de l'Agence Nationale pour la Transfusion Sanguine (ANTS), sous tutelle du Ministère de la Santé. Le traitement des données personnelles est encadré par l'Autorité de Protection des Données à caractère Personnel (APDP) et par le Code du Numérique du Bénin.

## Propriété intellectuelle

L'ensemble des éléments de la plateforme (marque, textes, interfaces) est protégé. Toute reproduction non autorisée est interdite.`,
  },

  confidentialite: {
    key: "confidentialite",
    title: "Politique de confidentialité",
    body: `La protection de vos données, en particulier vos données de santé, est une priorité. Cette page explique quelles informations nous recueillons, pourquoi, et quels sont vos droits.

## Données que nous recueillons

- Votre identité: nom, prénom, âge, ville.
- Vos coordonnées: téléphone, e-mail.
- Votre groupe sanguin (facultatif tant qu'il n'est pas confirmé par un centre) et l'historique de vos dons.
- Votre position approximative, pour ne vous alerter qu'à proximité.

## Pourquoi nous les utilisons

- Vous mettre en relation avec les centres en cas de besoin proche.
- Vérifier l'authenticité de votre carte de donneur.
- Vous verser vos récompenses.

Vos données de santé ne sont jamais exposées lors d'une vérification de carte: seule l'authenticité et le groupe sanguin nécessaire sont confirmés, sans révéler vos informations privées.

## Consentement

Nous recueillons votre consentement explicite à l'inscription. Vous pouvez le retirer à tout moment en demandant la suppression de votre compte.

## Vos droits

- Accéder à vos données et en obtenir une copie.
- Les corriger si elles sont inexactes.
- Demander leur suppression.

## Cadre réglementaire

Le traitement de vos données respecte le cadre applicable en Afrique de l'Ouest: au Bénin, le Code du Numérique et le contrôle de l'Autorité de Protection des Données à caractère Personnel (APDP); à l'échelle régionale et continentale, l'Acte additionnel de la CEDEAO sur la protection des données et la Convention de Malabo de l'Union Africaine.

## Conservation et sécurité

Vos données sont conservées le temps nécessaire à la fourniture du service et protégées par des mesures de sécurité adaptées. Votre clé personnelle n'est jamais stockée sur nos serveurs: elle reste sur votre appareil.`,
  },

  conditions: {
    key: "conditions",
    title: "Conditions d'utilisation",
    body: `En utilisant HEMORA, vous acceptez les conditions ci-dessous. Elles définissent le rôle de chacun et les règles de bon usage.

## Objet du service

HEMORA met en relation des donneurs volontaires et des structures de santé, facilite les alertes en cas de besoin et permet de récompenser les dons. La plateforme ne réalise aucun acte médical.

## Engagements du donneur

- Fournir des informations exactes.
- Comprendre que son groupe sanguin reste à confirmer par un centre agréé avant tout don effectif.
- Garder sa clé personnelle en sécurité.

## Engagements des structures

- Être une structure de santé légitime, validée par la plateforme.
- N'utiliser les données des donneurs que pour la mise en relation et le suivi des dons.
- Respecter les règles de sécurité transfusionnelle.

## Récompenses

Les récompenses versées aux donneurs sont un encouragement au don volontaire. Une même personne ne peut être récompensée qu'une fois par période définie, afin de prévenir tout abus.

## Responsabilité

La sécurité transfusionnelle relève des centres de santé agréés. HEMORA ne saurait être tenu responsable des décisions médicales, qui restent du ressort des professionnels de santé.

## Évolution des conditions

Ces conditions peuvent évoluer. Les utilisateurs sont informés des changements importants.`,
  },
};

export const LEGAL_KEYS = Object.keys(LEGAL_DOCUMENTS) as LegalKey[];
