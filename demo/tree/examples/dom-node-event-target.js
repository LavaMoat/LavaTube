import tree from '../tree.js';

document.body.onmousemove = (e) => {
    const t = tree(e, window, parseInt(limit.value));
    console.log(treeify.asTree(t));
    document.body.onmousemove = null;
}
