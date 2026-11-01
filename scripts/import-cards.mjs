#!/usr/bin/env node
// Importe les cartes du jeu My Little Pony (Enterplay) depuis PonyHead et génère
// src/data/cards.js. À lancer à la main :
//   node scripts/import-cards.mjs
// PonyHead embarque toutes ses cartes dans son script ; on lit ce tableau comme du texte
// (sans exécuter le script) et on le convertit en JSON. Données PonyHead : CC BY-SA.

import { writeFile } from 'node:fs/promises';

const SOURCE = 'https://ponyhead.com/js/app.js';
const OUTPUT = new URL('../src/data/cards.js', import.meta.url);

// Extensions vendues en boosters, dans l'ordre de sortie. Les cinq dernières ont été
// créées par la communauté après l'arrêt du jeu.
const BOOSTER_SETS = [
  ['Premiere', 'PR'],
  ['Canterlot Nights', 'CN'],
  ['Crystal Games', 'CG'],
  ['Absolute Discord', 'AD'],
  ['Equestrian Odysseys', 'EO'],
  ['High Magic', 'HM'],
  ['Marks In Time', 'MT'],
  ['Defenders of Equestria', 'DE'],
  ['Seaquestria and Beyond', 'SB'],
  ['Friends Forever', 'FF'],
  ['Leaders and Legends', 'LL', true],
  ['New Dawn', 'ND', true],
  ['Fond Memories', 'FM', true],
  ['New Generation', 'NG', true],
  ['Tales of Light', 'TL', true],
];
// Raretés trouvées en booster ; les promos (hors boosters) ne sont pas importées.
const RARITY_CODES = {
  Common: 'C',
  Uncommon: 'U',
  Rare: 'R',
  Fixed: 'F',
  'Super Rare': 'SR',
  'Ultra Rare': 'UR',
};
// Illustration du booster : de préférence une des six héroïnes en Ultra Rare.
const MANE_SIX = ['Twilight Sparkle', 'Rainbow Dash', 'Pinkie Pie', 'Fluttershy', 'Rarity', 'Applejack'];

// Convertit le littéral JavaScript qui commence à `start` en JSON : clés nues entre
// guillemets, chaînes réécrites, !0/!1 en booléens.
function literalToJson(src, start) {
  const out = [];
  let depth = 0;
  let i = start;
  const ident = /[A-Za-z_$][A-Za-z0-9_$]*/y;
  for (;;) {
    const c = src[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      let raw = '';
      while (src[j] !== c) {
        if (src[j] === '\\') {
          raw += src.slice(j, j + 2);
          j += 2;
        } else {
          raw += src[j];
          j += 1;
        }
      }
      if (c === "'") raw = raw.replace(/\\'/g, "'").replace(/"/g, '\\"');
      out.push(`"${raw}"`);
      i = j + 1;
    } else if (c === '[' || c === '{') {
      depth += 1;
      out.push(c);
      i += 1;
    } else if (c === ']' || c === '}') {
      depth -= 1;
      out.push(c);
      i += 1;
      if (depth === 0) return out.join('');
    } else if (src.startsWith('!0', i) || src.startsWith('!1', i)) {
      out.push(src[i + 1] === '0' ? 'true' : 'false');
      i += 2;
    } else if (src.startsWith('void 0', i)) {
      out.push('null');
      i += 6;
    } else {
      ident.lastIndex = i;
      const match = ident.exec(src);
      if (!match) {
        out.push(c);
        i += 1;
        continue;
      }
      const word = match[0];
      const end = i + word.length;
      const last = [...out].reverse().find((token) => token.trim());
      if (src[end] === ':' && (last === '{' || last === ',')) out.push(`"${word}"`);
      else if (['null', 'true', 'false'].includes(word)) out.push(word);
      else throw new Error(`Identifiant inattendu « ${word} » à la position ${i}`);
      i = end;
    }
  }
}

function toCard(raw, code) {
  const number = raw.allIds && raw.allIds[0] ? raw.allIds[0].replace(/\D/g, '') : '';
  const card = {
    id: raw.id,
    name: raw.title,
    rarity: RARITY_CODES[raw.rarity],
    type: raw.type,
    color: raw.color,
  };
  if (raw.subtitle) card.subtitle = raw.subtitle;
  if (number) card.number = `${code} #${number}`;
  return card;
}

function featuredOf(cards) {
  const ultra = cards.filter((card) => card.rarity === 'UR');
  return (ultra.find((card) => MANE_SIX.includes(card.name)) || ultra[0] || cards[0]).id;
}

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`PonyHead ${response.status}`);
const source = await response.text();
const allCards = JSON.parse(literalToJson(source, source.indexOf('[{aliases:')));

const sets = BOOSTER_SETS.map(([name, code, fan]) => {
  const cards = allCards
    .filter((raw) => raw.set === name && RARITY_CODES[raw.rarity])
    .map((raw) => toCard(raw, code))
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
  if (!cards.length) throw new Error(`Aucune carte pour ${name}`);
  const counts = {};
  for (const card of cards) counts[card.rarity] = (counts[card.rarity] || 0) + 1;
  console.log(`${code} « ${name} » : ${cards.length} cartes`, counts);
  return { id: code, code, name, fan: Boolean(fan), featured: featuredOf(cards), cards };
});

const lines = sets.map(({ cards, ...info }) => `  OPP.sets[${JSON.stringify(info.id)}] = { ...${JSON.stringify(info)}, cards: [\n${cards.map((card) => `    ${JSON.stringify(card)},`).join('\n')}\n  ] };`);
await writeFile(OUTPUT, `// Généré par scripts/import-cards.mjs depuis PonyHead (CC BY-SA) — ne pas éditer à la main.
// Image d'une carte : https://ponyhead.com/img/cards/<id>.jpg
(function (root) {
  const OPP = (root.OPP = root.OPP || {});
  OPP.setOrder = ${JSON.stringify(sets.map((set) => set.id))};
  OPP.sets = OPP.sets || {};
${lines.join('\n')}
})(globalThis);
`);
console.log(`${sets.length} extensions → ${OUTPUT.pathname}`);
