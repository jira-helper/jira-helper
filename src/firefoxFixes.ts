/**
 * In firefox extension runtime resize observer polyfill tries to get global object by invoking `new Function('return this')` which leads to CSP error
 * To fix it we define `global`, so global shim works without invoking Function
 * @see https://github.com/que-etc/resize-observer-polyfill/blob/master/src/shims/global.js
 */
function fixCSPErrorInResizeObvserverPolyfill() {
  if (globalThis) {
    globalThis.global = globalThis;
  }
}

fixCSPErrorInResizeObvserverPolyfill();
