function key(prop, val) {
    const proto = `${({}).toString.call(val)}`;
    return prop;  // "ownerDocument"
    return proto; // "[object HTMLDocument]"
}

function prepareCB(tree = {}) {
    return function cb(val, dst, path) {
        if (val === dst) {
            let subtree = tree;
            for (let i =  0; i < path.length; i++) {
                if (!subtree[path[i]]) {
                    subtree[path[i]] = path.length - 1 === i ? 0 : {};
                }
                subtree = subtree[path[i]];
            }
        }
    }
}

function tree(src, dst, limit) {
    const tree = {};
    walk(src, dst, {limit, key, cb: prepareCB(tree)});
    return tree;
}