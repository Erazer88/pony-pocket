# Pony Pocket

Jeu mobile de collection de cartes My Little Pony, inspiré de Pokémon TCG Pocket : pas
de combat, on ouvre des boosters pour compléter sa collection. Copie du jeu
[One Piece Pocket](https://github.com/Erazer88/one-piece-pocket) avec les cartes du jeu
de cartes My Little Pony (Enterplay).

Jouer : **https://erazer88.github.io/pony-pocket/** (GitHub Pages, branche `main`).

Prototype web sans framework ni dépendance : ouvrir `index.html` dans un navigateur.

## Jouer

- **Introduction** : « mini game », un toucher lance la musique et révèle le menu.
- **Accès** : identifiant et mot de passe (comptes dans `src/data/accounts.js`).
- **Accueil** : fais défiler les 15 boosters, puis touche « Ouvrir ». Un booster gratuit
  se recharge toutes les 6 heures, avec jusqu'à 2 boosters en réserve.
- **Choix** : 10 boosters identiques tournent sur une roue ; touche celui qui te plaît.
- **Ouverture** : glisse le doigt sur le haut du booster pour le découper, puis glisse
  chaque carte. Les Super Rare et Ultra Rare arrivent face cachée : touche-les.
- **Collection** et **Profil** : progression par extension et par rareté.

Pour essayer sans attendre, ajoute `?test` à l'adresse : les boosters deviennent
illimités. La collection est enregistrée sur l'appareil, séparément pour chaque compte.

## Cartes

Les données et les images viennent de [PonyHead](https://ponyhead.com) (CC BY-SA). Le
script d'import lit le tableau de cartes intégré au script de PonyHead comme du texte,
sans l'exécuter, et génère `src/data/cards.js` :

```sh
node scripts/import-cards.mjs
```

15 extensions vendues en boosters : les 10 officielles (Premiere à Friends Forever) et
5 créées par la communauté après l'arrêt du jeu (Leaders and Legends, New Dawn, Fond
Memories, New Generation, Tales of Light). Les cartes promo ne sont pas importées.
Les cartes et illustrations My Little Pony sont la propriété de Hasbro et Enterplay :
projet de fan non commercial.

## Taux de drop

Un booster contient 10 cartes : 6 communes, 2 peu communes, 1 rare et une dernière
carte. Les taux viennent du [wiki du jeu](https://mlpccg.fandom.com/wiki/Card_Rarity),
par boîte de 36 boosters :

| Dernière carte | Par boîte | Par booster |
| --- | --- | --- |
| Super Rare | 8 (extensions qui en ont) | 22 % |
| Ultra Rare | 2,77 (Premiere), 3,27 (Canterlot Nights, Crystal Games, Absolute Discord), 4 (autres) | 8 à 11 % |
| Commune (sinon) | — | le reste |

Les cartes « fixes », normalement vendues en decks (les héroïnes de départ, par
exemple), peuvent sortir à la place de la rare pour que toutes restent à collectionner.

## Son

Musique du menu : **Mother Sea** (bande originale de One Piece, Kohei Tanaka), reprise
du jeu d'origine. C'est une œuvre protégée, ajoutée à la demande du propriétaire du
dépôt : à retirer si les ayants droit le demandent. Bruitages libres de droits ; voir
[`assets/audio/CREDITS.md`](assets/audio/CREDITS.md).

## Organisation

| Fichier | Rôle |
| --- | --- |
| `scripts/import-cards.mjs` | Importe les cartes depuis PonyHead et génère `src/data/cards.js`. |
| `scripts/hash-password.mjs` | Donne l'entrée d'un nouveau compte (empreinte du mot de passe). |
| `src/data/cards.js` | Cartes des 15 extensions (généré, ne pas éditer). |
| `src/data/labels.js` | Libellés, rangs et niveaux d'effet des raretés, couleurs et types. |
| `src/data/boosters.js` | Composition des boosters, taux de drop et recharge (déclaratif). |
| `src/data/audio.js` | Musique, bruitages, volumes et crédits audio. |
| `src/data/accounts.js` | Comptes autorisés (identifiant et empreinte du mot de passe). |
| `src/booster.js` | Tirage d'un booster, pur et déterministe si on lui passe une graine. |
| `src/cards.js` | Niveau d'effet, score de rareté, libellés et image d'une carte. |
| `src/collection.js` | Collection et statistiques du joueur, sauvegarde. |
| `src/timer.js` | Recharge des boosters gratuits (pur, testé). |
| `src/auth.js` | Vérification de l'accès, session et progression par compte. |
| `src/ui/` | Interface : introduction, cartes, ouverture animée, son, écrans et modales. |
| `src/app.js` | Initialisation et navigation entre les écrans. |

Les sauvegardes utilisent le préfixe `ppk.` : servi depuis le même domaine que One Piece
Pocket (GitHub Pages), ce jeu ne partage pas sa progression avec lui.

## Tests

```sh
node --test
```
