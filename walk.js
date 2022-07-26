function shouldIgnore(prop, obj, values) {
    // no reason to try climbing through __proto__ which throws
    // error if we already do that by using Object.getPrototypeOf
    function shouldIgnoreProtoProperty() {
        return prop === '__proto__';
    }

    // when trying to access an SVGLength value property of an SVG node that is
    // not attached to DOM, you get an error - we avoid that here
    function shouldIgnoreSvgLengthValue() {
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

    return (
        shouldIgnoreProtoProperty() ||
        shouldIgnoreSvgLengthValue()
    );
}

function handleOpts(opts = {}) {
    if (typeof opts.cb !== 'function') {
        throw '@options.cb must be a function';
    }
    if (typeof opts.key !== 'function') {
        opts.key = (prop, val) => `${({}).toString.call(val)}:${prop}`;
    }
    if (typeof opts.limit !== 'number') {
        opts.limit = 5;
    }
    return opts;
}

function shouldWalk(obj, values, limit) {
    if (limit === 0) {
        return false;
    }
    if (obj === null || typeof obj !== 'object') {
        return false;
    }
    if (values.includes(obj)) {
        return false;
    }
    return true;
}

const cache = new Map();

function getAllPropsFromCache(obj) {
    let ownProps = cache.get(obj);
    if (!ownProps) {
        ownProps = Object.getOwnPropertyNames(obj);
        cache.set(obj, ownProps);
    }

    return ownProps;
}

function getAllProps(obj, props = []) {
    if (!obj) {
        return props;
    }

    props = [...props, ...getAllPropsFromCache(obj)];
    return getAllProps(Object.getPrototypeOf(obj), props);
}

function walk(obj, dst, opts = {}, keys = [], values = []) {
    const {cb, key, limit} = handleOpts(opts);
    if (!shouldWalk(obj, values, limit)) {
        return;
    }

    const props = getAllProps(obj);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (shouldIgnore(prop, obj, values)) {
            continue;
        }

        const val = obj[prop];

        const newKeys = [...keys, key(prop, val)];
        const newValues = [...values, obj];
        const newOpts = {cb, key, limit: limit-1};

        walk(val, dst, newOpts, newKeys, newValues);

        cb(val, dst, newKeys);
    }
}