(function(){
    const tree = require('./tree');
    document.body.onmousemove = (e) => {
        const t = tree(e, window, parseInt(limit.value));
        console.log(treeify.asTree(t));
        document.body.onmousemove = null;
    }
}());