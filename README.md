# lavatube

walk through the proto chain

### demo

check out the [demo](https://lavamoat.github.io/LavaTube/demo/)

### install

`yarn add @lavamoat/lavatube` / `npm install @lavamoat/lavatube`

### use

```javascript
const LavaTube = require('@lavamoat/lavatube');

const target = window;
const div = document.createElement('div');
document.body.appendChild(div);
const startRef = div;

const lt = new LavaTube();
// walk by specifying a visitor function
lt.walk(startRef, visitorFn);
// or using an iterator
for (const [value, path] of lt.iterate(startRef)) {
    if (checkValueForTarget(value, path)) {
        break;
    }
}

// new instance with different options
new LavaTube({
    maxDepth: 9
}).walk(window, (value, path) => {
    // returning true stops iteration
    return checkValueForTarget(value, path);
});

function checkValueForTarget (value, path) {
    if (value === target) {
        console.log('found value:', value);
        console.log('path to value was:', path);
        return true;
    }
}

// options object can be passed as second argument to LavaTube constructor optionally:
const opts = {
    // a function with which the visited keys during walking 
    // process can be customizd for how they appear within 
    // @path argument (useful for aggregation purposes).
    generateKey, // [default (key, value) => key]
    
    // a boolean indicating we should invoke getters
    shouldInvokeGetters, //[default true]

    // a number to indicate the maximum recursion depth lavatube is allowed to walk.
    maxDepth, // [default Infinity]

    // a function that allows you to skip walking the provided value
    shouldWalk, // [default (target) => true]

    // a function that allows you to reveal additional props for a value (if you have more context on its type you might be able to get additional values by calling its methods)
    defaultGetAdditionalProps, // [default () => []]

    // a boolean indicating if we should search depth first instead of breadth first
    depthFirst, // [default false]

    // we cant iterate WeakMaps on their own, but we can take every value that we find and try it as a key each WeakMap
    exhaustiveWeakMapSearch, // [default false]

    // when dealing with multiple Realms, we cant inspect Maps, Sets, or WeakMaps without knowing about the other Realm's named intrinsics. This option allows you to specify these.
    realms, // [default [globalThis]]
};
```

### note

A LavaTube instance holds the options to use when walking.
It does not cache visited nodes so it is safe for re-use.
