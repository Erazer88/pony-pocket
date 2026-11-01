const test = require('node:test');
const assert = require('node:assert/strict');

require('../src/data/cards.js');
require('../src/data/labels.js');
require('../src/cards.js');
require('../src/collection.js');

const { OPP } = globalThis;
const { Collection, Cards } = OPP;
const cards = OPP.setOrder.flatMap((id) => OPP.sets[id].cards);
const byId = (id) => cards.find((card) => card.id === id);

function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('record signale les nouvelles cartes et met à jour les statistiques', () => {
  const collection = { pr7: 1 };
  const stats = Collection.loadStats(fakeStorage());
  const pack = [byId('pr7'), byId('hm11'), byId('hm0')];
  const newIds = Collection.record(collection, stats, pack);
  assert.deepEqual([...newIds], ['hm11', 'hm0']);
  assert.equal(collection.pr7, 2);
  assert.deepEqual(stats, { packsOpened: 1, cardsPulled: 3, lastPack: ['pr7', 'hm11', 'hm0'] });
});

test('la sauvegarde se recharge et ignore les données corrompues', () => {
  const storage = fakeStorage();
  Collection.save(storage, { pr7: 2 }, { packsOpened: 3, cardsPulled: 30, lastPack: ['pr7'] });
  assert.deepEqual(Collection.load(storage), { pr7: 2 });
  assert.equal(Collection.loadStats(storage).packsOpened, 3);

  const broken = fakeStorage({ 'ppk.collection.v1': '{"pr7":"x","pr9":-1,"pr10":1}', 'ppk.stats.v1': 'pas du json' });
  assert.deepEqual(Collection.load(broken), { pr10: 1 });
  assert.deepEqual(Collection.loadStats(broken), { packsOpened: 0, cardsPulled: 0, lastPack: [] });

  Collection.clear(storage);
  assert.deepEqual(Collection.load(storage), {});
});

test('les niveaux d\'effet et les libellés suivent la rareté', () => {
  assert.equal(Cards.tierOf(byId('pr7')), 'common');
  assert.equal(Cards.tierOf(byId('pr9')), 'common');
  assert.equal(Cards.tierOf(byId('pr10')), 'rare');
  assert.equal(Cards.tierOf(byId('pr1')), 'rare');
  assert.equal(Cards.tierOf(byId('hm11')), 'super');
  assert.equal(Cards.tierOf(byId('hm0')), 'secret');
  assert.ok(Cards.scoreOf(byId('hm0')) > Cards.scoreOf(byId('hm11')));
  assert.equal(Cards.rarityLabel(byId('hm0')), 'Ultra Rare');
  assert.equal(Cards.colorLabel(byId('pr7')), 'Bleu');
  assert.equal(Cards.typeLabel(byId('pr1')), 'Personnage principal');
  assert.equal(Cards.numberOf(byId('pr1')), 'PR #1');
  assert.equal(Cards.imageOf(byId('pr1')), 'https://ponyhead.com/img/cards/pr1.jpg');
});
