# walker

walk through the proto chain

## demo

check out the [demo](https://lavamoat.github.io/walker/demo/)

## install

`yarn add @lavamoat/walker` / `npm install @lavamoat/walker`

## use

```javascript
const Walker = require('@lavamoat/walker');

new Walker(cb, opts = {}).walk(start); // example

new Walker((value, path) => {
    console.log('found value:', value);
    console.log('path to value was:', path);
    if (value === 1) {
        return true; // true means stop walker
    }
}, {maxRecursionLimit: 9}).walk(window);

// options object can be passed as second argument to Walker constructor optionally:
const opts = {
    // a function with which the visited keys during walking 
    // process can be customizd for how they appear within 
    // @path argument (useful for aggregation purposes).
    generateKey, // (k) => '__' + k + '__'
    // a boolean to indicate whether to use or avoid cache for visited values.
    // when true, walker will not skip walking into non primitive values that were already processed.
    avoidValuesCache, // true/false [default false]
    // a Set when prefered providing your own cache Set when @avoidValuesCache is set to false.
    // useful when running multiple walkers in a single execution.
    valuesCacheSet, // new Set()
    // a boolean to indicate whether to use or avoid cache for visited properties.
    // when true, walker will not avoid generating own properties of objects to walk into more than once.
    avoidPropertiesCache, // true/false [default false]
    // a Map when prefered providing your own cache Map when @avoidPropertiesCache is set to false.
    // useful when running multiple walkers in a single execution.
    propertiesCacheMap, // new Map()
    // a number to indicate the maximum recursion depth walker is allowed to walk.
    maxRecursionLimit, // 3 [default 5]
};
```