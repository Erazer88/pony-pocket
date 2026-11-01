const test = require('node:test');
const assert = require('node:assert/strict');

require('../src/data/cards.js');
require('../src/data/labels.js');
require('../src/data/boosters.js');
require('../src/booster.js');

const { OPP } = globalThis;
const { createRng, resolvePool, openPack } = OPP.Booster;

test('les slots fixes et le remplissage ont des cartes dans chaque extension', () => {
  for (const boosterId of OPP.boosterOrder) {
    const setCards = OPP.sets[boosterId].cards;
    for (const slot of OPP.boosters[boosterId].slots) {
      const pool = slot.perBox ? slot.fill : slot.pool;
      assert.ok(resolvePool(setCards, pool).length > 0, `${boosterId} ${JSON.stringify(pool)}`);
    }
  }
});

test('un booster contient 10 cartes distinctes, la plus rare en dernier', () => {
  const rng = createRng(1);
  for (let i = 0; i < 500; i += 1) {
    const pack = openPack('HM', rng);
    assert.equal(pack.length, 10);
    assert.equal(OPP.Booster.packSize('HM'), 10);
    assert.equal(new Set(pack.map((c) => c.id)).size, 10);
    assert.deepEqual(pack.slice(0, 8).map((c) => c.rarity), ['C', 'C', 'C', 'C', 'C', 'C', 'U', 'U']);
    assert.ok(['R', 'F'].includes(pack[8].rarity));
    assert.ok(['C', 'SR', 'UR'].includes(pack[9].rarity));
  }
});

test('le tirage est déterministe pour une graine donnée', () => {
  const ids = (seed) => openPack('PR', createRng(seed)).map((c) => c.id);
  assert.deepEqual(ids(42), ids(42));
  assert.notDeepEqual(ids(42), ids(43));
});

test('chaque extension ouvre des boosters de 10 cartes connues', () => {
  const rng = createRng(7);
  for (const boosterId of OPP.boosterOrder) {
    assert.equal(OPP.Booster.packSize(boosterId), 10);
    for (let i = 0; i < 300; i += 1) {
      const pack = openPack(boosterId, rng);
      assert.equal(pack.length, 10, boosterId);
      assert.equal(new Set(pack.map((c) => c.id)).size, 10, boosterId);
      assert.ok(pack.every((c) => OPP.rarities[c.rarity]), boosterId);
    }
  }
});

function perBox(boosterId, boxes, seed) {
  const rng = createRng(seed);
  const totals = { SR: 0, UR: 0 };
  for (let i = 0; i < boxes * OPP.boosters[boosterId].packsPerBox; i += 1) {
    for (const card of openPack(boosterId, rng)) if (card.rarity in totals) totals[card.rarity] += 1;
  }
  return { SR: totals.SR / boxes, UR: totals.UR / boxes };
}

test('les moyennes par boîte de 36 boosters suivent les taux réels', () => {
  const highMagic = perBox('HM', 1500, 2024);
  assert.ok(Math.abs(highMagic.SR - 8) < 0.3, `SR ${highMagic.SR}`);
  assert.ok(Math.abs(highMagic.UR - 4) < 0.2, `UR ${highMagic.UR}`);
  // Premiere : pas de Super Rare, 2,77 Ultra Rare par boîte.
  const premiere = perBox('PR', 1500, 2025);
  assert.equal(premiere.SR, 0);
  assert.ok(Math.abs(premiere.UR - 2.77) < 0.2, `UR ${premiere.UR}`);
});
