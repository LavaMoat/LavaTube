(()=>{var e={655:e=>{e.exports=function(e,t,r,o){try{return function(e,t){if(t===window?.Symbol?.prototype)return"description"===e;switch(t){case window?.WebAssembly?.Instance.prototype:return"exports"===e;case window?.WebAssembly?.Global.prototype:return"value"===e;case window?.WebAssembly?.Memory.prototype:return"buffer"===e;case window?.WebAssembly?.Table.prototype:return"length"===e}switch(t){case window?.ViewTransition?.prototype:return"ready"===e||"finished"===e||"updateCallbackDone"===e;case window?.ServiceWorkerContainer?.prototype:return"ready"===e;case window?.Object?.getPrototypeOf(document?.fonts):return"loading"===e||"finished"===e||"ready"===e;case window?.WritableStreamDefaultWriter?.prototype:return"loading"===e||"closed"===e||"ready"===e;case window?.ReadableStreamDefaultReader?.prototype:case window?.ReadableStreamBYOBReader?.prototype:return"closed"===e;case window?.PromiseRejectionEvent?.prototype:return"promise"===e;case window?.FontFace?.prototype:return"loaded"===e;case window?.BeforeInstallPromptEvent?.prototype:return"userChoice"===e;case window?.Animation?.prototype:case window?.CSSAnimation?.prototype:case window?.CSSTransition?.prototype:return"finished"===e||"ready"===e;case window?.MediaKeySession?.prototype:return"closed"===e;case window?.WebTransport?.prototype:return"ready"===e||"closed"===e;case window?.ImageTrackList?.prototype:return"ready"===e;case window?.ImageDecoder?.prototype:return"completed"===e;case window?.PresentationReceiver?.prototype:return"connectionList"===e;case window?.BackgroundFetchRecord?.prototype:return"responseReady"===e;case window?.NavigationTransition?.prototype:return"finished"===e;case window?.RTCPeerConnection?.prototype:return"peerIdentity"===e}return!1}(e,t)||function(e,t,r){if("value"!==e||"[object SVGLength]"!=={}.toString.call(t))return!1;for(let e=0;e<r.length;e++){const t=r[e];if(t?.isConnected)return!1}return!0}(e,t,r)||function(e,t){try{return t[e],!1}catch(e){return!0}return!0}(e,t)}catch(r){return o(e,t,r)}}},352:(e,t,r)=>{const o=r(655),n=r(285);function i(){let{generateKey:e,onShouldIgnoreError:t,avoidValuesCache:r,avoidPropertiesCache:o,valuesCacheSet:n,propertiesCacheMap:i,maxRecursionLimit:a}=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};"function"!=typeof e&&(e=(e,t)=>`${{}.toString.call(t)}:${e}`),"function"!=typeof t&&(t=(e,t,r)=>{throw r}),"number"!=typeof a&&(a=5),(o=Boolean(o))||"object"!=typeof i&&(i=new Map),(r=Boolean(r))||"object"!=typeof n&&(n=new Set),this.generateKey=e,this.onShouldIgnoreError=t,this.avoidValuesCache=r,this.avoidPropertiesCache=o,this.valuesCacheSet=n,this.propertiesCacheMap=i,this.maxRecursionLimit=a}i.prototype.shouldWalk=function(e,t){return!(function(e){if(null===e)return!0;const t=typeof e;return"bigint"===t||"boolean"===t||"number"===t||"string"===t}(e)||0===t||!this.avoidValuesCache&&(this.valuesCacheSet.has(e)||(this.valuesCacheSet.add(e),0)))},i.prototype.walkRecursively=function(e,t,r){let i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:[];if(!this.shouldWalk(e,r))return!1;const s=!this.avoidPropertiesCache&&this.propertiesCacheMap,c=n(e,s);for(let n=0;n<c.length;n++){const s=c[n];if(o(s,e,a,this.onShouldIgnoreError))continue;const p=e[s],u=[...i,this.generateKey(s,p)],l=[...a,e];if(this.walkRecursively(p,t,r-1,u,l)||t(p,u))return!0}return!1},i.prototype.walkIteratively=function(e,t){var r=this;let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[];return function*(){if(yield[val,i],!r.shouldWalk(e,t))return;const s=!r.avoidPropertiesCache&&r.propertiesCacheMap,c=n(e,s);for(let n=0;n<c.length;n++){const s=c[n];if(o(s,e,a,r.onShouldIgnoreError))continue;const p=e[s],u=[...i,r.generateKey(s,p)],l=[...a,e];yield*r.walkIteratively(p,t-1,u,l)}return!1}()},i.prototype.walk=function(e,t){return this.walkRecursively(e,t,this.maxRecursionLimit)},e.exports=i},285:e=>{function t(e,t){if(!t)return Object.getOwnPropertyNames(e);let r=t.get(e);return r||(r=Object.getOwnPropertyNames(e),t.set(e,r)),r}e.exports=function e(r,o){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];return r?(n=[...n,...t(r,o)],e(Object.getPrototypeOf(r),o,n)):n}}},t={};function r(o){var n=t[o];if(void 0!==n)return n.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,r),i.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=r(352),t=r.n(e);Object.defineProperty(globalThis,"LavaTube",{configurable:!0,writable:!0,value:t()})})()})();