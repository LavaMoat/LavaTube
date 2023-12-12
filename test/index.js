import test from 'ava';
import LavaTube from '../src/index.js';

test('non-visitable initial value', t => {
  const start = 1;
  const allValues = getAll({}, start);
  t.deepEqual(allValues, []);
})

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
    exhaustiveWeakMapSearch: true,
  }

  const shouldBeMissing = find({}, start, secret);
  t.deepEqual(shouldBeMissing, undefined);
  const shouldBeFound = find(opts, start, secret);
  t.deepEqual(shouldBeFound, [
    'map',
    '<weakmap key (obj)>',
  ]);
})

test('exhaustiveWeakMapSearch - non-visitable', t => {
  const map = new WeakMap();
  const obj = {};
  const nonVistitable = 'abc'
  map.set(obj, nonVistitable);
  const start = {
    map,
    obj,
  };
  const opts = {
    exhaustiveWeakMapSearch: true,
  }

  const allValues = getAll(opts, start);
  t.false(allValues.includes(nonVistitable));
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
  }

  const shouldBeMissing = find({}, start, secret);
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

function getAll (opts, start) {
  const results = [];
  new LavaTube(opts).walk(start, (value, path) => {
    results.push(value);
  });
  return results;
}