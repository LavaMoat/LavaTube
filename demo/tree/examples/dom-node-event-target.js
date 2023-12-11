import tree, { showResult } from '../tree.js';

document.body.onmousemove = (e) => {
    const t = tree(e, window, parseInt(limit.value));
    showResult(treeify.asTree(t));
    document.body.onmousemove = null;
}
