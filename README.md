# walker

walk through the proto chain

## demo

check out the [demo](https://lavamoat.github.io/walker/demo/)

## install

`yarn add @lavamoat/walker` / `npm install @lavamoat/walker`

## use

```javascript
const walk = require('@lavamoat/walker');

walk(start, cb, opts = {}); // example

walk(window, (value, path) => {
    console.log('found value:', value);
    console.log('path to value was:', path);
    if (value === 1) {
        return true; // true means stop walker
    }
});

// options object can be passed as third argument optionally:
const opts = {
    limit: 3, // recursive depth
    key: (k) => '__' + k + '__', // customize keys that construct the path
};
```