function key(prop, val) { // customize aggregation
    const proto = `${({}).toString.call(val)}`;
    return prop;  // "ownerDocument"
    return proto; // "[object HTMLDocument]"
}

function tree(src, dst, limit) {
    function cb(val, dst, path) {
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

    const tree = {};
    walk(src, dst, {limit, key, cb});
    return tree;
}