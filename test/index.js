import test from 'ava';
import { createContext, runInContext } from 'vm';
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

test('find array value', t => {
  const target = {};
  const start = [target];
  const path = find({}, start, target);
  t.deepEqual(path, ['0']);
})

test('find iterable value', t => {
  const target = {};
  const values = [target];
  const start = {
    [Symbol.iterator] () {
      return {
        next () {
          return {
            done: values.length === 0,
            value: values.pop(),
          };
        },
        return () {
          return {
            done: true,
            value: undefined,
          };
        },
        throw () {
          return {
            done: true,
            value: undefined,
          };
        }
      };
    }
  };
  const path = find({}, start, target);
  t.deepEqual(path, ['<iterable (0)>']);
})

test('find iterator value', t => {
  const target = {};
  const values = [target];
  const start = {
    next () {
      return {
        done: values.length === 0,
        value: values.pop(),
      };
    },
    return () {
      return {
        done: true,
        value: undefined,
      };
    },
    throw () {
      return {
        done: true,
        value: undefined,
      };
    }
  };
  const path = find({}, start, target);
  t.deepEqual(path, ['<iterator (0)>']);
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

test('depth 0', t => {
  const start = { a: {} };
  const allValues = getAll({ maxDepth: 0 }, start);
  t.deepEqual(allValues, [start]);
})

test('depth 1', t => {
  const target = {};
  {
    const start = { target };
    const path = find({ maxDepth: 1 }, start, target);
    t.deepEqual(path, ['target']);
  }
  {
    const start = { a: { target } };
    const path = find({ maxDepth: 1 }, start, target);
    t.deepEqual(path, undefined);
  }
})

test('depthFirst - visit ordering', t => {
  const a = Object.create(null);
  const b = Object.create(null);
  const c = Object.create(null);
  const d = Object.create(null);
  const e = Object.create(null);
  const f = Object.create(null);

  const start = {
    __proto__: a,
    b,
    c,
  }
  a.d = d;
  d.f = f;
  b.e = e;

  {
    const allValues = getAll({}, start);
    t.deepEqual(allValues, [
      // indentation shows depth
      start,
        a,
        b,
        c,
          d,
          e,
            f,
    ]);
  }
  {
    const allValues = getAll({ depthFirst: true }, start);
    t.deepEqual(allValues, [
      // indentation shows depth
      start,
        a,
          d,
            f,
        b,
          e,
        c,
    ]);
  }
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
    '<WeakMap value (obj)>',
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

// this test ensures we attempt to access WeakMaps as we discover them,
// using earlier and newly discovered values as keys
test('exhaustiveWeakMapSearch - nested', t => {
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
    '<WeakMap value ()>',
    '<WeakMap value (<WeakMap value ()>)>',
    '<WeakMap value (<WeakMap value ()>,<WeakMap value (<WeakMap value ()>)>)>',
    '<WeakMap value ()>',
  ]);
})

test('exhaustiveWeakMapSearch - depth', t => {
  const map = new WeakMap();
  const obj = {};
  const target = {};
  map.set(obj, target);
  const opts = {
    exhaustiveWeakMapSearch: true,
    maxDepth: 2,
  }

  {
    const start = { map, obj };
    const path = find(opts, start, target);
    t.deepEqual(path, ['map', '<WeakMap value (obj)>']);
  }
  {
    const start = { a: { map, obj } };
    const path = find(opts, start, target);
    t.deepEqual(path, undefined);
  }
})

test('cross-realm property', t => {
  const vmGlobalThis = makeVmRealm();
  const target = {};
  const start = vmGlobalThis.Object.create(null);
  start.target = target;
  const path = find({}, start, target);
  t.deepEqual(path, ['target']);
})

test('cross-realm prototype', t => {
  const vmGlobalThis = makeVmRealm();
  const target = {};
  const start = vmGlobalThis.Object.create(target);
  const path = find({}, start, target);
  t.deepEqual(path, ['<prototype>']);
})

test('realms - Map value', t => {
  const vmGlobalThis = makeVmRealm();
  const target = {};
  const start = vmGlobalThis.eval('new Map()');
  start.set({}, target);

  {
    const path = find({}, start, target);
    t.deepEqual(path, ['<iterable (0)>', '1']);
  }
  {
    const path = find({ realms: [globalThis, vmGlobalThis] }, start, target);
    t.deepEqual(path, ['<Map value ([object Object])>']);
  }
})

test('realms - WeakMap value', t => {
  const vmGlobalThis = makeVmRealm();
  const target = {};
  const map = vmGlobalThis.eval('new WeakMap()');
  const obj = {};
  map.set(obj, target);
  const start = {
    map,
    obj,
  };

  {
    const path = find({
      exhaustiveWeakMapSearch: true,
    }, start, target);
    t.deepEqual(path, undefined);
  }
  {
    const path = find({
      exhaustiveWeakMapSearch: true,
      realms: [globalThis, vmGlobalThis],
    }, start, target);
    t.deepEqual(path, ['map', '<WeakMap value (obj)>']);
  }
})

test('cross-realm Symbol.iterator sanity check', t => {
  const vmGlobalThis = makeVmRealm();
  const set = new Set([1]);
  t.is(Symbol.iterator, vmGlobalThis.Symbol.iterator);
  t.deepEqual(
    set[Symbol.iterator](),
    set[vmGlobalThis.Symbol.iterator](),
  );
  const foreignSet = vmGlobalThis.eval('new Set([1])');
  t.deepEqual(
    set[Symbol.iterator](),
    foreignSet[Symbol.iterator](),
  );
})

test('handle errors - throwing proxy', t => {
  const proxy = makeAlwaysThrowProxy({});
  const target = {}
  const start = { proxy, target }
  let allValues;
  t.notThrows(() => {
    allValues = getAll({}, start);
  });
  t.true(allValues.includes(target));
  t.true(allValues.includes(proxy));
})

test('handle errors - function throwing proxy', t => {
  const proxy = makeAlwaysThrowProxy(() => {});
  const target = {}
  const start = { proxy, target }
  let allValues;
  t.notThrows(() => {
    allValues = getAll({}, start);
  });
  t.true(allValues.includes(target));
  t.true(allValues.includes(proxy));
})

test('handle errors - iterable + iterator throwing proxy', t => {
  const proxy = makeAlwaysThrowProxy(() => {});
  const target = {}
  const start = {
    proxy,
    target,
    next: proxy,
    [Symbol.iterator]: proxy,
  }
  let allValues;
  t.notThrows(() => {
    allValues = getAll({}, start);
  });
  t.true(allValues.includes(target));
  t.true(allValues.includes(proxy));
})

// handle errors like "TypeError: Method get Intl.v8BreakIterator.prototype.next called on incompatible receiver"
test('handle errors - throw on iterator getter', t => {
  const target = {}
  const start = {
    get next () {
      throw new Error('throw get next')
    },
    target,
  }
  let allValues;
  t.notThrows(() => {
    allValues = getAll({}, start);
  });
  t.true(allValues.includes(target));
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

function makeVmRealm () {
  const sandbox = createContext();
  const vmGlobalThis = runInContext('this', sandbox);
  return vmGlobalThis;
}

function makeAlwaysThrowProxy (target) {
  if (typeof target !== 'object' && typeof target !== 'function') {
    throw new Error('target must be an object');
  }
  return new Proxy(target, {
    get () {
      throw new Error('always throw proxy: get');
    },
    apply () {
      throw new Error('always throw proxy: apply');
    },
    construct () {
      throw new Error('always throw proxy: construct');
    },
    defineProperty () {
      throw new Error('always throw proxy: defineProperty');
    },
    deleteProperty () {
      throw new Error('always throw proxy: deleteProperty');
    },
    get () {
      throw new Error('always throw proxy: get');
    },
    getOwnPropertyDescriptor () {
      throw new Error('always throw proxy: getOwnPropertyDescriptor');
    },
    getPrototypeOf () {
      throw new Error('always throw proxy: getPrototypeOf');
    },
    has () {
      throw new Error('always throw proxy: has');
    },
    isExtensible () {
      throw new Error('always throw proxy: isExtensible');
    },
    ownKeys () {
      throw new Error('always throw proxy: ownKeys');
    },
    preventExtensions () {
      throw new Error('always throw proxy: preventExtensions');
    },
    set () {
      throw new Error('always throw proxy: set');
    },
    setPrototypeOf () {
      throw new Error('always throw proxy: setPrototypeOf');
    },
  });
}