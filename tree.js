function key(prop, val) {
    const proto = `${({}).toString.call(val)}`;
    return prop;  // "ownerDocument"
    return proto; // "[object HTMLDocument]"
}

function prepareCB(tree = {}) {
    return function cb(val, dst, path) {
        if (val === dst) {
            console.log('found!', val, dst);
        }
    }
}

function tree(src, dst, limit) {
    const tree = {};
    walk(src, dst, {limit, key, cb: prepareCB(tree)});
    return tree;
}