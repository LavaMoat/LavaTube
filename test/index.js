import test from 'ava';
import LavaTube from '../src/index.js';

test('find initial', t => {
  const target = {};
  const allValues = getAll({}, target, target);
  t.deepEqual(allValues, [target]);
})

test('find property', t => {
  const target = {};
  const start = { target };
  const path = find({}, start, target);
  t.deepEqual(path, ['target']);
})

test('find getter fn', t => {
  const start = { get target () {} };
  const target = Reflect.getOwnPropertyDescriptor(start, 'target').get;
  const path = find({}, start, target);
  t.deepEqual(path, ['<getter (target)>']);
})

test('find getter value', t => {
  const target = {};
  const start = { get target () { return target } };
  const path = find({}, start, target);
  t.deepEqual(path, ['<get (target)>']);
})

test('find prototype', t => {
  const target = {};
  const start = Object.create(target);
  const path = find({}, start, target);
  t.deepEqual(path, ['<prototype>']);
})

test('find prototype property', t => {
  const target = {};
  const obj = { target };
  const start = Object.create(obj);
  const path = find({}, start, target);
  t.deepEqual(path, ['target']);
})

test('find prototype getter fn', t => {
  const obj = { get target () {} };
  const target = Reflect.getOwnPropertyDescriptor(obj, 'target').get;
  const start = Object.create(obj);
  const path = find({}, start, target);
  t.deepEqual(path, ['<getter (target)>']);
})

test('find prototype getter value', t => {
  const target = {};
  const obj = { get target () { return target } };
  const start = Object.create(obj);
  const path = find({}, start, target);
  t.deepEqual(path, ['<get (target)>']);
})

test('find shadowed property', t => {
  const target = {};
  const fakeTarget = {};
  const start = Object.create({ target });
  start.target = fakeTarget;
  const path = find({}, start, target);
  t.deepEqual(path, ['<shadowed (target)>']);
})

test('find shadowed getter value', t => {
  const target = {};
  const obj = { get target () { return target } };
  const fakeTarget = {};
  const start = Object.create(obj);
  Reflect.defineProperty(start, 'target', { value: fakeTarget });
  const path = find({}, start, target);
  t.deepEqual(path, ['<get (<shadowed (target)>)>']);
})

test('find shadowed getter fn', t => {
  const obj = { get target () {} };
  const target = Reflect.getOwnPropertyDescriptor(obj, 'target').get;
  const fakeTarget = {};
  const start = Object.create({ target });
  start.target = fakeTarget;
  const path = find({}, start, target);
  t.deepEqual(path, ['<shadowed (target)>']);
})

test('find Map value', t => {
  const target = {};
  const start = new Map([['target', target]]);
  const path = find({}, start, target);
  t.deepEqual(path, ['<Map value (target)>']);
})

test('find Map key', t => {
  const target = {};
  const start = new Map([[target, 1]]);
  const path = find({}, start, target);
  t.deepEqual(path, ['<Map key ([object Object])>']);
})

test('find Set value', t => {
  const target = {};
  const start = new Set([target]);
  const path = find({}, start, target);
  t.deepEqual(path, ['<Set value ([object Object])>']);
})

test('non-visitable initial value', t => {
  const start = 1;
  const allValues = getAll({}, start);
  t.deepEqual(allValues, []);
})

test('exhaustiveWeakMapSearch', t => {
  const map = new WeakMap();
  const obj = {};
  const target = {};
  map.set(obj, target);
  const start = {
    map,
    obj,
  };
  const opts = {
    exhaustiveWeakMapSearch: true,
  }

  const shouldBeMissing = find({}, start, target);
  t.deepEqual(shouldBeMissing, undefined);
  const shouldBeFound = find(opts, start, target);
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

  const target = {};
  lastWeakMap.set(firstWeakMap, target);
  const start = firstWeakMap;
  const opts = {
    exhaustiveWeakMapSearch: true,
  }

  const shouldBeMissing = find({}, start, target);
  t.deepEqual(shouldBeMissing, undefined);
  const shouldBeFound = find(opts, start, target);
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

function getAll (opts, start, target) {
  const results = [];
  new LavaTube(opts).walk(start, (value, path) => {
    results.push(value);
    if (target !== undefined && value === target) {
      return true;
    }
  });
  return results;
}