const ignoreErrors = [
    "Illegal invocation",
    "'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them",
];

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
            shouldIgnoreHardcodedProtos(prop, obj) ||
            shouldIgnoreSvgLengthValue(prop, obj, values) ||
            shouldIgnoreDynamicProtos(prop, obj)
        );
    } catch (error) {
        return onerror(prop, obj, error);
    }
}

module.exports = shouldIgnore;
