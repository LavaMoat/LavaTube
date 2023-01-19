(function(){
    const tree = require('./tree');
    const a = document.createElement('a');
    a.setAttribute('x', 'y');
    setTimeout(() => {
        const t = tree(a, window, parseInt(limit.value));
        console.log(treeify.asTree(t));
    });
}());