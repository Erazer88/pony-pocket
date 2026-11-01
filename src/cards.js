// Règles d'affichage d'une carte : niveau d'effet, score de rareté et libellés.
(function (root) {
  const OPP = (root.OPP = root.OPP || {});

  function tierOf(card) {
    const variant = card.variant && OPP.variants[card.variant];
    return (variant && variant.tier) || OPP.rarities[card.rarity].tier;
  }

  function scoreOf(card) {
    const bonus = card.variant ? OPP.variants[card.variant].bonus : 0;
    return OPP.rarities[card.rarity].rank + bonus;
  }

  function rarityLabel(card) {
    const base = OPP.rarities[card.rarity].label;
    return card.variant ? `${base} ${OPP.variants[card.variant].label}` : base;
  }

  function colorLabel(card) {
    return card.color.split(' ').map((color) => OPP.colors[color] || color).join(' / ');
  }

  function typeLabel(card) {
    return OPP.cardTypes[card.type] || card.type;
  }

  // Images des cartes hébergées par PonyHead.
  function imageOf(card) {
    return `https://ponyhead.com/img/cards/${card.id}.jpg`;
  }

  // Pas d'autre source d'image : le repli est l'image elle-même.
  function fallbackImageOf(card) {
    return imageOf(card);
  }

  // Numéro imprimé sur la carte (« PR #4 »).
  function numberOf(card) {
    return card.number || card.id.toUpperCase();
  }

  // Toutes les cartes importées sortent des boosters.
  function isCollectible() {
    return true;
  }

  OPP.Cards = {
    tierOf,
    scoreOf,
    rarityLabel,
    colorLabel,
    typeLabel,
    imageOf,
    fallbackImageOf,
    numberOf,
    isCollectible,
  };
})(globalThis);
