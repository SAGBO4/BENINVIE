# Fonctionnalités de HEMORA (BMM)

Ce document liste et explique les différentes fonctionnalités de la plateforme HEMORA, qui a pour but de relier les donneurs volontaires aux besoins urgents des structures de santé tout en garantissant l'intégrité des données grâce à la blockchain Bitcoin.

## Liste des Fonctionnalités

### 1. Gestion des Donneurs

- **Enregistrement et Profil** : Permet aux donneurs de s'inscrire sur la plateforme, de renseigner leur groupe sanguin, leur localisation et leurs coordonnées.
- **Historique des dons** : Suivi des dons de sang précédents effectués par le donneur.

### 2. Recherche et Compatibilité

- **Recherche ciblée** : Les structures de santé peuvent rechercher rapidement des donneurs compatibles en fonction du groupe sanguin requis et de la proximité géographique.

### 3. Alertes d'Urgence

- **Création d'alertes** : En cas de besoin critique de sang, les centres de santé peuvent émettre des alertes.
- **Notifications ciblées** : Les alertes sont envoyées en temps réel (ou par d'autres canaux) spécifiquement aux donneurs compatibles se trouvant à proximité.

### 4. Campagnes de Don

- **Organisation** : Création et planification d'événements de collecte de sang.
- **Gestion des inscriptions** : Les donneurs peuvent s'inscrire pour participer aux différentes campagnes de don organisées près de chez eux.

### 5. Cartes Vérifiables

- **Cartes numériques et physiques** : Émission de cartes de donneur uniques.
- **Vérification** : Capacité pour les autorités médicales de vérifier facilement l'authenticité de la carte d'un donneur (via QR code, par exemple).

### 6. Preuves Bitcoin (Intégrité des données)

- **Ancrage** : Les données critiques (comme l'enregistrement d'un don ou l'authenticité d'une carte) sont ancrées cryptographiquement sur la blockchain Bitcoin.
- **Transparence et Sécurité** : Assure que les informations médicales et les registres ne peuvent pas être falsifiés de manière rétroactive.

### 7. Récompenses Lightning

- **Incitations** : Intégration du réseau Lightning (Lightning Network) de Bitcoin pour distribuer de petites récompenses ou incitations financières (sats) aux donneurs pour encourager le don de sang.

---

## Diagramme de Cas d'Utilisation

Voici le diagramme représentant les interactions entre les différents acteurs (Donneur, Structure de Santé, et le Système/Admin) et la plateforme.

```mermaid
usecaseDiagram
    actor "Donneur" as Donneur
    actor "Structure de Santé" as Hopital
    actor "Administrateur / Système" as Admin

    package "Plateforme HEMORA" {
        usecase "S'enregistrer et gérer son profil" as UC1
        usecase "Recevoir des alertes d'urgence" as UC2
        usecase "S'inscrire à une campagne" as UC3
        usecase "Consulter son historique" as UC4

        usecase "Lancer une alerte d'urgence" as UC5
        usecase "Rechercher donneurs compatibles" as UC6
        usecase "Vérifier une carte de donneur" as UC7
        usecase "Organiser une campagne de don" as UC8

        usecase "Ancrer des preuves sur Bitcoin" as UC9
        usecase "Gérer les récompenses Lightning" as UC10
    }

    Donneur --> UC1
    Donneur --> UC2
    Donneur --> UC3
    Donneur --> UC4

    Hopital --> UC5
    Hopital --> UC6
    Hopital --> UC7
    Hopital --> UC8

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10

    UC5 ..> UC6 : <<include>>
    UC4 ..> UC7 : <<extend>>
```
