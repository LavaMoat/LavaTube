import test from 'ava';
import LavaTube from '../src/index.js';

const generateKey = (key) => key

test('exhaustiveWeakMapSearch', t => {
  const map = new WeakMap();
  const obj = {};
  const secret = {};
  map.set(obj, secret);
  const start = {
    map,
    obj,
  };
  const opts = {
    generateKey,
    exhaustiveWeakMapSearch: true,
  }

  const shouldBeMissing = find({ generateKey }, start, secret);
  t.deepEqual(shouldBeMissing, undefined);
  const shouldBeFound = find(opts, start, secret);
  t.deepEqual(shouldBeFound, [
    'map',
    '<weakmap key (obj)>',
  ]);
})

test('exhaustiveWeakMapSearch - deep', t => {
  const firstWeakMap = new WeakMap()
  let lastWeakMap = firstWeakMap
  const addWeakMap = () => {
    const weakMap = new WeakMap()
    lastWeakMap.set(lastWeakMap, weakMap)
    lastWeakMap = weakMap
  }
  addWeakMap()
  addWeakMap()
  addWeakMap()

  const secret = {};
  lastWeakMap.set(firstWeakMap, secret);
  const start = firstWeakMap;
  const opts = {
    exhaustiveWeakMapSearch: true,
    generateKey,
  }

  const shouldBeMissing = find({ generateKey }, start, secret);
  t.deepEqual(shouldBeMissing, undefined);
  const shouldBeFound = find(opts, start, secret);
  t.deepEqual(shouldBeFound, [
    '<weakmap key ()>',
    '<weakmap key (<weakmap key ()>)>',
    '<weakmap key (<weakmap key ()>,<weakmap key (<weakmap key ()>)>)>',
    '<weakmap key ()>',
  ]);
})

function find (opts, start, target) {
  let result;
  new LavaTube(opts).walk(start, (value, path) => {
    if (value === target) {
      result = path
      return true
    }
  });
  return result;
}