/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 655:
/***/ ((module) => {

const ignoreErrors = ["Illegal invocation", "'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them"];

// TODO: lavatube will fail cross realms due to identity discontinuity lack of support - fix when needed
const ignoreProtos = {
  'description': Symbol.prototype,
  'exports': WebAssembly.Instance.prototype,
  'value': WebAssembly.Global.prototype,
  'buffer': WebAssembly.Memory.prototype,
  'length': WebAssembly.Table.prototype
};

// ignore properties that when accessed return a promise
// so that lavatube won't have to modify itself to async-await
function shouldIgnoreAsyncProps(prop, obj) {
  if (prop === 'ready' || prop === 'loading') {
    if (ServiceWorkerContainer.prototype === obj) {
      return true;
    }
    if (Object.getPrototypeOf(document.fonts) === obj) {
      return true;
    }
  }
  return false;
}

// some properties found on __proto__ can only be accessed
// via an instance of the prototype rather than the prototype itself
function shouldIgnoreProtoProperty(prop, obj) {
  if (ignoreProtos.hasOwnProperty(prop) && ignoreProtos[prop] === obj) {
    return true;
  }
  try {
    obj[prop];
    return false;
  } catch (error) {
    if (!ignoreErrors.includes(error.message)) {
      throw error;
    }
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
    return shouldIgnoreAsyncProps(prop, obj) || shouldIgnoreSvgLengthValue(prop, obj, values) || shouldIgnoreProtoProperty(prop, obj);
  } catch (error) {
    return onerror(prop, obj, error);
  }
}
module.exports = shouldIgnore;

/***/ }),

/***/ 352:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const LavaTube = __webpack_require__(492);
module.exports = LavaTube;

/***/ }),

/***/ 492:
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
LavaTube.prototype.walkRecursively = function (obj, limit) {
  let keys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  let values = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
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
    if (this.walkRecursively(val, limit - 1, newKeys, newValues) || this.cb(val, newKeys)) {
      return true;
    }
  }
  return false;
};
function LavaTube(cb, _ref) {
  let {
    generateKey,
    onShouldIgnoreError,
    avoidValuesCache,
    avoidPropertiesCache,
    valuesCacheSet,
    propertiesCacheMap,
    maxRecursionLimit
  } = _ref;
  if (typeof cb !== 'function') {
    throw new Error(`@cb must be a function, instead got a "${typeof cb}"`);
  }
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
  this.cb = cb;
  this.generateKey = generateKey;
  this.onShouldIgnoreError = onShouldIgnoreError;
  this.avoidValuesCache = avoidValuesCache;
  this.avoidPropertiesCache = avoidPropertiesCache;
  this.valuesCacheSet = valuesCacheSet;
  this.propertiesCacheMap = propertiesCacheMap;
  this.maxRecursionLimit = maxRecursionLimit;
}
LavaTube.prototype.walk = function (start) {
  return this.walkRecursively(start, this.maxRecursionLimit);
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
/* harmony import */ var _src_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(352);
/* harmony import */ var _src_index__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_src_index__WEBPACK_IMPORTED_MODULE_0__);

(function (win) {
  Object.defineProperty(win, 'LavaTube', {
    configurable: true,
    writable: true,
    value: (_src_index__WEBPACK_IMPORTED_MODULE_0___default())
  });
})(window);
})();

/******/ })()
;