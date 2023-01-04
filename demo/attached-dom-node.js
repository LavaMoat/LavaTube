(function(){
    setTimeout(() => {
        const a = {}
        a.b = a;
        const t = tree(a, a, parseInt(limit.value));
        console.log(treeify.asTree(t));
    });
}());