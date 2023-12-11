import tree, { showResult } from '../tree.js';

const a = document.createElement('a');

const t = tree(a, window, parseInt(limit.value));
showResult(treeify.asTree(t));
