import LavaTube from '../../src/index.js';

function walkAndSearch(start, end){
    let result = false;
    new LavaTube().walk(start, (val) => {
        return result = result || val === end;
    });
    return result;
}
function walkAndSearchAndLog(start, end) {
    console.log('Does\n', start, '\nlead to\n', end, '\n?', walkAndSearch(start, end));
}

walkAndSearchAndLog(window, window);
walkAndSearchAndLog(window, document);
walkAndSearchAndLog(document, window);
walkAndSearchAndLog(document, WebAssembly);
walkAndSearchAndLog(WebAssembly, document);