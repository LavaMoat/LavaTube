function key(prop, val) { // customize aggregation
    const proto = `${({}).toString.call(val)}`;
    return prop;  // "ownerDocument"
    return proto; // "[object HTMLDocument]"
}

function tree(src, dst, limit) {
    function eachValue(val, path) {
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
    new LavaTube({
        generateKey: key,
        maxRecursionLimit: limit,
    }).walk(src, eachValue);
    return tree;
}

module.exports = tree;