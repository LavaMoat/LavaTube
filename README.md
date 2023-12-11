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

new LavaTube({ maxRecursionLimit: 9}).walk(window, (value, path) => {
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
    generateKey, // [default (key, value) => `${valueString}:${keyString}`]
    
    // a boolean indicating we should invoke getters
    shouldInvokeGetters, //[default true]

    // a number to indicate the maximum recursion depth lavatube is allowed to walk.
    maxRecursionLimit, // [default Infinity]

    // a function that allows you to skip walking the provided value
    shouldWalk, // [default (target) => true]

    // a function that allows you to reveal additional props for a value (eg Map entries)
    defaultGetAdditionalProps, // [default handles Map and Set for this Realm]
};
```
