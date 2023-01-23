const ignoreErrors = [
    "Illegal invocation",
    "'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them",
];

// TODO: walker will fail cross realms due to identity discontinuity lack of support - fix when needed
const ignoreProtos = {
    'description': Symbol.prototype,
    'exports': WebAssembly.Instance.prototype,
    'value': WebAssembly.Global.prototype,
    'buffer': WebAssembly.Memory.prototype,
    'length': WebAssembly.Table.prototype,
}

// ignore properties that when accessed return a promise
// so that walker won't have to modify itself to async-await
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
    if (prop !== 'value' || ({}).toString.call(obj) !== '[object SVGLength]') {
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
        return (
            shouldIgnoreAsyncProps(prop, obj) ||
            shouldIgnoreSvgLengthValue(prop, obj, values) ||
            shouldIgnoreProtoProperty(prop, obj)
        );
    } catch (error) {
        return onerror(prop, obj, error);
    }
}

module.exports = shouldIgnore;