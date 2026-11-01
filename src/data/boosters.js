// Composition des boosters et recharge. Les taux viennent du wiki du jeu My Little Pony
// (Enterplay) : voir README.md, section « Taux de drop ».
(function (root) {
  const OPP = (root.OPP = root.OPP || {});

  // Un booster gratuit toutes les 6 heures ; jusqu'à 2 boosters en réserve.
  OPP.packTimer = { intervalHours: 6, maxCharges: 2 };

  // Ultra Rare par boîte de 36 boosters selon l'extension (4 pour les autres).
  const ULTRA_PER_BOX = { PR: 2.77, CN: 3.27, CG: 3.27, AD: 3.27 };

  // Dernière carte du booster, en cartes par boîte de 36 boosters : environ un booster
  // sur trois remplace une commune par une Super Rare ou une Ultra Rare. Une extension
  // sans Super Rare (les premières) laisse cette place à une commune.
  function hitsPerBox(code) {
    return [
      { amount: 8, pool: { rarity: 'SR' } },
      { amount: ULTRA_PER_BOX[code] || 4, pool: { rarity: 'UR' } },
    ];
  }

  // 10 cartes par booster : 6 communes, 2 peu communes, 1 rare (ou une carte « fixe »,
  // normalement vendue en deck, pour que toutes les cartes restent à collectionner) et la
  // dernière carte.
  function slotsFor(code) {
    return [
      { count: 6, pool: { rarity: 'C' } },
      { count: 2, pool: { rarity: 'U' } },
      { count: 1, pool: { rarity: ['R', 'F'] } },
      { count: 1, perBox: hitsPerBox(code), fill: { rarity: 'C' } },
    ];
  }

  // Couleurs du booster selon la couleur de sa carte vedette.
  const PALETTES = {
    Blue: ['#8fd3ff', '#3a8fe0'],
    Orange: ['#ffc27a', '#ec7f2c'],
    Pink: ['#ffaad6', '#e05c9f'],
    Purple: ['#cfa8ff', '#8250d9'],
    White: ['#e4e8f2', '#9aa6c0'],
    Yellow: ['#ffe48a', '#e2ad2c'],
    Multicolor: ['#ffb0d8', '#8f7bff'],
  };

  OPP.boosters = OPP.boosters || {};
  OPP.boosterOrder = OPP.setOrder.slice();
  for (const setId of OPP.boosterOrder) {
    const set = OPP.sets[setId];
    const featured = set.cards.find((card) => card.id === set.featured);
    OPP.boosters[setId] = {
      id: setId,
      set: setId,
      name: set.name,
      packsPerBox: 36,
      palette: PALETTES[featured.color] || PALETTES.Purple,
      slots: slotsFor(set.code),
    };
  }
})(globalThis);
