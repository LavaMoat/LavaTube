# lavatube

walk through the proto chain

## demo

check out the [demo](https://lavamoat.github.io/lavatube/demo/)

## install

`yarn add @lavamoat/lavatube` / `npm install @lavamoat/lavatube`

## use

```javascript
const LavaTube = require('@lavamoat/lavatube');

new LavaTube(cb, opts = {}).walk(start); // example

new LavaTube((value, path) => {
    console.log('found value:', value);
    console.log('path to value was:', path);
    if (value === 1) {
        return true; // true means stop lavatube
    }
}, {maxRecursionLimit: 9}).walk(window);

// options object can be passed as second argument to LavaTube constructor optionally:
const opts = {
    // a function with which the visited keys during walking 
    // process can be customizd for how they appear within 
    // @path argument (useful for aggregation purposes).
    generateKey, // (k) => '__' + k + '__'
    // a function that catches errors thrown in the function that is trying to determine
    // whether a property of an object should be ignored from walking into or not.
    // since it is very delicate, the user can catch those errors and decide how to deal with them.
    // use it to return true to skip the property or false to try to walk into it.
    onShouldIgnoreError, // (prop, obj, error) => true <-- this will skip properties that failed the ignore-check
    // a boolean to indicate whether to use or avoid cache for visited values.
    // when true, lavatube will not skip walking into non primitive values that were already processed.
    avoidValuesCache, // true/false [default false]
    // a Set when prefered providing your own cache Set when @avoidValuesCache is set to false.
    // useful when running multiple lavatube walkers in a single execution.
    valuesCacheSet, // new Set()
    // a boolean to indicate whether to use or avoid cache for visited properties.
    // when true, lavatube will not avoid generating own properties of objects to walk into more than once.
    avoidPropertiesCache, // true/false [default false]
    // a Map when prefered providing your own cache Map when @avoidPropertiesCache is set to false.
    // useful when running multiple lavatube walkers in a single execution.
    propertiesCacheMap, // new Map()
    // a number to indicate the maximum recursion depth lavatube is allowed to walk.
    maxRecursionLimit, // 3 [default 5]
};
```