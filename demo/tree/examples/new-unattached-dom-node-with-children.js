(function(){
    const tree = require('./tree');
    const a = document.createElement('a');
    a.innerHTML = '<x></x>';
    setTimeout(() => {
        const t = tree(a, window, parseInt(limit.value));
        console.log(treeify.asTree(t));
    });
}());