# LavaTube

Javascript object graph walker. Tries to reach every possible value from a starting reference.

### demo

check out the [demo](https://lavamoat.github.io/LavaTube/demo/)

### usage

```javascript
import LavaTube from '@lavamoat/lavatube';

// get starting and target references for your search
const target = window;
const div = document.createElement('div');
document.body.appendChild(div);
const startRef = div;

// use "find" when looking for a path to a specific value
const path = LavaTube.find(startRef, target);

// use "walk" to visit every value by specifying a visitor function
// the visitor can return "true" to stop iteration and select the
// current value and path as the final result
const result = LavaTube.walk(startRef, checkValueForTarget);
if (result !== undefined) {
  const { value, path } = result;
  console.log(`found ${value} at ${path}`)
}

// use "iterate" to get an iterator for visiting values
for (const [value, path] of LavaTube.iterate(startRef)) {
  if (checkValueForTarget(value, path)) {
    console.log(`found ${value} at ${path}`)
    break;
  }
}

// configuration options can be specified as well
const opts = { maxDepth: 9 }
LavaTube.walk(window, (value, path) => {
  return checkValueForTarget(value, path);
}, opts);

function checkValueForTarget (value, path) {
  if (value === target) {
    console.log(`found ${value} at ${path}`)
    return true;
  }
  return false;
}

```

### limitations

LavaTube works by walking the object graph, including properties and prototypes.
However, some values are unreachable without calling functions with certain arguments.

```javascript
// LavaTube would not be able to access "secret" from just the function "get"
function get(password) {
  const secret = {}
  if (password === 's3cr3t') {
    return secret
  }
}
```

LavaTube does its best to find every value it can, but **consider a negative search result to be "inconclusive"** and not a proof of unreachability. See [this post](https://blog.ankursundara.com/shadow-dom/) for an idea of how something can still be reachable through esoteric means.

Additionally, property getters and Proxies further complicate object graph exploration. They can to return a new value on each access and can also trigger other side effects like adding new properties on objects we've already visited.

```javascript
const obj = {
  get abc () {
    // returns a new object on every access
    return {}
  }
}
const secret = obj.abc
// LavaTube will never see the same value as "secret"
LavaTube.walk(obj, () => { /* ... */ })
```

### install

`yarn add @lavamoat/lavatube` / `npm install @lavamoat/lavatube`

### options

```javascript

// configuration options object:
const opts = {
    // a boolean indicating we should invoke getters
    shouldInvokeGetters, //[default: true]

    // a boolean indicating if we should attempt to call all visited functions (with no arguments).
    shouldCallFunctions, // [default: false]

    // a boolean indicating if we should attempt to construct (new Thing()) all visited functions (with no arguments).
    shouldConstructFunctions, // [default: false]

    // we cant iterate WeakMaps on their own, but we can take every value that we find and try it as a key each WeakMap
    shouldBruteForceWeakMaps, // [default: false]

    // a function that allows you to skip walking the provided value
    shouldWalk, // [default: (target) => true]

    // a number to indicate the maximum recursion depth LavaTube is allowed to walk.
    maxDepth, // [default: Infinity]

    // a boolean indicating if we should search depth first instead of breadth first.
    // potentially useful when looking for a distantly connected value
    depthFirst, // [default: false]

    // a function that allows you to reveal additional props for a value (if you have more context on its type you might be able to get additional values by calling its methods)
    getAdditionalProps, // [default: () => []]

    // when dealing with multiple Realms, we cant inspect Maps, Sets, or WeakMaps without knowing about the other Realm's named intrinsics. This option allows you to specify these.
    realms, // [default: [globalThis]]

    // a function for modifying how the path segment strings are generated.
    generateKey, // [default: (key, value) => key]
};
```
