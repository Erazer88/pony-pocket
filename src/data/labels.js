// Libellés et rangs d'affichage des raretés, couleurs et types de carte.
// `tier` choisit les effets visuels : common, rare, super ou secret.
(function (root) {
  const OPP = (root.OPP = root.OPP || {});

  OPP.rarities = {
    C: { label: 'Commune', rank: 0, tier: 'common' },
    U: { label: 'Peu commune', rank: 1, tier: 'common' },
    F: { label: 'Fixe', rank: 2, tier: 'rare' },
    R: { label: 'Rare', rank: 2, tier: 'rare' },
    SR: { label: 'Super Rare', rank: 4, tier: 'super' },
    UR: { label: 'Ultra Rare', rank: 6, tier: 'secret' },
  };

  // Le jeu My Little Pony n'a pas d'impressions spéciales distinctes dans les données.
  OPP.variants = {};

  OPP.colors = {
    Blue: 'Bleu',
    Orange: 'Orange',
    Pink: 'Rose',
    Purple: 'Violet',
    White: 'Blanc',
    Yellow: 'Jaune',
    Multicolor: 'Multicolore',
    None: 'Neutre',
  };

  OPP.cardTypes = {
    Mane: 'Personnage principal',
    Friend: 'Ami',
    Event: 'Événement',
    Resource: 'Ressource',
    Troublemaker: 'Fauteur de troubles',
    Problem: 'Problème',
  };
})(globalThis);
