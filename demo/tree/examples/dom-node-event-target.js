(function(){
    document.body.onload = (e) => {
        const t = tree(e, window, parseInt(limit.value));
        console.log(treeify.asTree(t));
    }
}());