import init from "./src/index";

Object.defineProperty(globalThis, 'LavaTube', {
  configurable: true,
  writable: true,
  value: init,
});
