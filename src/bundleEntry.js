import init from "./index";

Object.defineProperty(globalThis, 'LavaTube', {
  configurable: true,
  writable: true,
  value: init,
});
