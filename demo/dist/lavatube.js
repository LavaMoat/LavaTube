/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 655:
/***/ ((module) => {

const ignoreErrors = (/* unused pure expression or super */ null && (["Illegal invocation", "'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them", "'get src' called on an object that does not implement interface HTMLScriptElement.", "'get type' called on an object that does not implement interface HTMLScriptElement.", "'get noModule' called on an object that does not implement interface HTMLScriptElement."]));
function shouldIgnoreHardcodedProtos(prop, obj) {
  // not sure
  switch (obj) {
    case window?.Symbol?.prototype:
      return prop === 'description';
  }
  // wasm
  switch (obj) {
    case window?.WebAssembly?.Instance.prototype:
      return prop === 'exports';
    case window?.WebAssembly?.Global.prototype:
      return prop === 'value';
    case window?.WebAssembly?.Memory.prototype:
      return prop === 'buffer';
    case window?.WebAssembly?.Table.prototype:
      return prop === 'length';
  }
  // promises
  switch (obj) {
    case window?.ViewTransition?.prototype:
      return prop === 'ready' || prop === 'finished' || prop === 'updateCallbackDone';
    case window?.ServiceWorkerContainer?.prototype:
      return prop === 'ready';
    case window?.Object?.getPrototypeOf(document?.fonts):
      return prop === 'loading' || prop === 'finished' || prop === 'ready';
    case window?.WritableStreamDefaultWriter?.prototype:
      return prop === 'loading' || prop === 'closed' || prop === 'ready';
    case window?.ReadableStreamDefaultReader?.prototype:
      return prop === 'closed';
    case window?.ReadableStreamBYOBReader?.prototype:
      return prop === 'closed';
    case window?.PromiseRejectionEvent?.prototype:
      return prop === 'promise';
    case window?.FontFace?.prototype:
      return prop === 'loaded';
    case window?.BeforeInstallPromptEvent?.prototype:
      return prop === 'userChoice';
    case window?.Animation?.prototype:
      return prop === 'finished' || prop === 'ready';
    case window?.CSSAnimation?.prototype:
      return prop === 'finished' || prop === 'ready';
    case window?.CSSTransition?.prototype:
      return prop === 'finished' || prop === 'ready';
    case window?.MediaKeySession?.prototype:
      return prop === 'closed';
    case window?.WebTransport?.prototype:
      return prop === 'ready' || prop === 'closed';
    case window?.ImageTrackList?.prototype:
      return prop === 'ready';
    case window?.ImageDecoder?.prototype:
      return prop === 'completed';
    case window?.PresentationReceiver?.prototype:
      return prop === 'connectionList';
    case window?.BackgroundFetchRecord?.prototype:
      return prop === 'responseReady';
    case window?.NavigationTransition?.prototype:
      return prop === 'finished';
    case window?.RTCPeerConnection?.prototype:
      return prop === 'peerIdentity';
  }
  return false;
}

// some properties found on __proto__ can only be accessed
// via an instance of the prototype rather than the prototype itself
function shouldIgnoreDynamicProtos(prop, obj) {
  try {
    obj[prop];
    return false;
  } catch (error) {
    // always ignore errors.
    // TODO: additionally, we should walk the errors.
    return true;
  }
  return true;
}

// when trying to access an SVGLength value property of an SVG node that is
// not attached to DOM, you get an error - we avoid that here
function shouldIgnoreSvgLengthValue(prop, obj, values) {
  if (prop !== 'value' || {}.toString.call(obj) !== '[object SVGLength]') {
    return false;
  }
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value?.isConnected) {
      return false;
    }
  }
  return true;
}
function shouldIgnore(prop, obj, values, onerror) {
  try {
    return shouldIgnoreHardcodedProtos(prop, obj) || shouldIgnoreSvgLengthValue(prop, obj, values) || shouldIgnoreDynamicProtos(prop, obj);
  } catch (error) {
    return onerror(prop, obj, error);
  }
}
module.exports = shouldIgnore;

/***/ }),

/***/ 352:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const shouldIgnore = __webpack_require__(655);
const getAllProps = __webpack_require__(285);
function isPrimitive(obj) {
  if (obj === null) {
    return true;
  }
  const type = typeof obj;
  return type === 'bigint' || type === 'boolean' || type === 'number' || type === 'string';
}
LavaTube.prototype.shouldWalk = function (obj, limit) {
  if (isPrimitive(obj)) {
    return false;
  }
  if (limit === 0) {
    return false;
  }
  if (this.avoidValuesCache) {
    return true;
  }
  if (this.valuesCacheSet.has(obj)) {
    return false;
  }
  this.valuesCacheSet.add(obj);
  return true;
};
LavaTube.prototype.walkRecursively = function (obj, visitorFn, limit) {
  let keys = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  let values = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  if (!this.shouldWalk(obj, limit)) {
    return false;
  }
  const cache = !this.avoidPropertiesCache && this.propertiesCacheMap;
  const props = getAllProps(obj, cache);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (shouldIgnore(prop, obj, values, this.onShouldIgnoreError)) {
      continue;
    }
    const val = obj[prop];
    const newKeys = [...keys, this.generateKey(prop, val)];
    const newValues = [...values, obj];
    if (this.walkRecursively(val, visitorFn, limit - 1, newKeys, newValues) || visitorFn(val, newKeys)) {
      return true;
    }
  }
  return false;
};
LavaTube.prototype.walkIteratively = function (obj, limit) {
  var _this = this;
  let keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  let values = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  return function* () {
    yield [val, keys];
    if (!_this.shouldWalk(obj, limit)) {
      return;
    }
    const cache = !_this.avoidPropertiesCache && _this.propertiesCacheMap;
    const props = getAllProps(obj, cache);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (shouldIgnore(prop, obj, values, _this.onShouldIgnoreError)) {
        continue;
      }
      const val = obj[prop];
      const newKeys = [...keys, _this.generateKey(prop, val)];
      const newValues = [...values, obj];
      yield* _this.walkIteratively(val, limit - 1, newKeys, newValues);
    }
    return false;
  }();
};
function LavaTube() {
  let {
    generateKey,
    onShouldIgnoreError,
    avoidValuesCache,
    avoidPropertiesCache,
    valuesCacheSet,
    propertiesCacheMap,
    maxRecursionLimit
  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (typeof generateKey !== 'function') {
    generateKey = (prop, val) => `${{}.toString.call(val)}:${prop}`;
  }
  if (typeof onShouldIgnoreError !== 'function') {
    onShouldIgnoreError = (prop, obj, error) => {
      throw error;
    };
  }
  if (typeof maxRecursionLimit !== 'number') {
    maxRecursionLimit = 5;
  }
  if (!(avoidPropertiesCache = Boolean(avoidPropertiesCache))) {
    if (typeof propertiesCacheMap !== 'object') {
      propertiesCacheMap = new Map();
    }
  }
  if (!(avoidValuesCache = Boolean(avoidValuesCache))) {
    if (typeof valuesCacheSet !== 'object') {
      valuesCacheSet = new Set();
    }
  }
  this.generateKey = generateKey;
  this.onShouldIgnoreError = onShouldIgnoreError;
  this.avoidValuesCache = avoidValuesCache;
  this.avoidPropertiesCache = avoidPropertiesCache;
  this.valuesCacheSet = valuesCacheSet;
  this.propertiesCacheMap = propertiesCacheMap;
  this.maxRecursionLimit = maxRecursionLimit;
}
LavaTube.prototype.walk = function (start, visitorFn) {
  return this.walkRecursively(start, visitorFn, this.maxRecursionLimit);
};
module.exports = LavaTube;

/***/ }),

/***/ 285:
/***/ ((module) => {

function getAllPropsFromCache(obj, cache) {
  if (!cache) {
    return Object.getOwnPropertyNames(obj);
  }
  let ownProps = cache.get(obj);
  if (!ownProps) {
    ownProps = Object.getOwnPropertyNames(obj);
    cache.set(obj, ownProps);
  }
  return ownProps;
}
function getAllProps(obj, cache) {
  let props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  if (!obj) {
    return props;
  }
  props = [...props, ...getAllPropsFromCache(obj, cache)];
  return getAllProps(Object.getPrototypeOf(obj), cache, props);
}
module.exports = getAllProps;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(352);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index__WEBPACK_IMPORTED_MODULE_0__);

Object.defineProperty(globalThis, 'LavaTube', {
  configurable: true,
  writable: true,
  value: (_index__WEBPACK_IMPORTED_MODULE_0___default())
});
})();

/******/ })()
;