import LavaTube from '../../src/index.js';

function toString (val) {
    return `${val}`;
}

function showResult (start, end, result) {
    const display = document.createElement('pre');
    display.innerHTML = `
      Does ${toString(start)} lead to ${toString(end)}? ${result ? 'Yes' : 'No'}
    `;
    document.body.appendChild(display)
    console.log('Does\n', start, '\nlead to\n', end, '\n?', result);
}

function walkAndSearch(start, end){
    let result = false;
    new LavaTube().walk(start, (val) => {
        return result = result || val === end;
    });
    return result;
}
function walkAndSearchAndLog(start, end) {
    showResult(start, end, walkAndSearch(start, end));
}

walkAndSearchAndLog(window, window);
walkAndSearchAndLog(window, document);
walkAndSearchAndLog(document, window);
walkAndSearchAndLog(document, WebAssembly);
walkAndSearchAndLog(WebAssembly, document);