import init from "./src/index";

( function(win) { Object.defineProperty(win, 'LavaTube', { configurable: true, writable: true, value: init }); }( window ) );