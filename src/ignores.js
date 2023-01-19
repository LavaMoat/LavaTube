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
function shouldIgnoreProtoProperty(prop, obj, keys) {
    if (keys[keys.length - 1] !== '__proto__') {
        return false;
    }
    try {
        obj[prop];
        return false;
    } catch (cause) {
        if (cause.message !== 'Illegal invocation') {
            throw new Error('Unexpected error thrown in walker:', {cause});
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

function shouldIgnore(prop, obj, keys, values) {
    return (
        shouldIgnoreAsyncProps(prop, obj) ||
        shouldIgnoreSvgLengthValue(prop, obj, values) ||
        shouldIgnoreProtoProperty(prop, obj, keys)
    );
}

module.exports = shouldIgnore;