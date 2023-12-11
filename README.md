# lavatube

walk through the proto chain

## demo

check out the [demo](https://lavamoat.github.io/LavaTube/demo/)

## install

`yarn add @lavamoat/lavatube` / `npm install @lavamoat/lavatube`

## use

```javascript
const LavaTube = require('@lavamoat/lavatube');

new LavaTube(opts = {}).walk(start, visitorFn); // example

new LavaTube({ maxRecursionLimit: 9}).walk(window, (value, path) => {
    console.log('found value:', value);
    console.log('path to value was:', path);
    if (value === 1) {
        return true; // true means stop lavatube
    }
});

// options object can be passed as second argument to LavaTube constructor optionally:
const opts = {
    // a function with which the visited keys during walking 
    // process can be customizd for how they appear within 
    // @path argument (useful for aggregation purposes).
    generateKey, // [default (key, value) => `${valueString}:${keyString}`]
    
    // a boolean indicating we should invoke getters
    shouldInvokeGetters, //[default true]

    // a number to indicate the maximum recursion depth lavatube is allowed to walk.
    maxRecursionLimit, // [default Infinity]

    // a function that allows you to skip walking the provided value
    shouldWalk, // [default (target) => true]
};
```
