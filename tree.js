function tree(src, dst, limit = 10000) {
    const tree = {};
    walk(src, dst, (val, dst, path) => {
        if (val === dst) {
            let subtree = tree;
            for (let i =  0; i < path.length; i++) {
                if (!subtree[path[i]]) {
                    subtree[path[i]] = path.length - 1 === i ? 0 : {};
                }
                subtree = subtree[path[i]];
            }
        }
    }, (prop, val) => `${({}).toString.call(val)}`, limit);
    return tree;
}