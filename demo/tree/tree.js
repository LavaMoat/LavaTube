import LavaTube from '../../src/index.js';

function key(prop, val) { // customize aggregation
    const proto = `${({}).toString.call(val)}`;
    return prop;  // "ownerDocument"
    return proto; // "[object HTMLDocument]"
}

export default function tree(src, dst, limit) {
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
    LavaTube.walk(src, eachValue, {
        generateKey: key,
        maxDepth: limit,
    });
    return tree;
}

function escape(htmlStr) {
    return htmlStr.replaceAll(/&/g, "&amp;")
          .replaceAll(/</g, "&lt;")
          .replaceAll(/>/g, "&gt;")
          .replaceAll(/"/g, "&quot;")
          .replaceAll(/'/g, "&#39;");
 }

export function showResult (treeString) {
    const display = document.createElement('pre');
    display.innerHTML = escape(treeString);
    document.body.appendChild(display)
    console.log(treeString);
}
