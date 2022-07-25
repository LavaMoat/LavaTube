const ignores = ['__proto__'];

const cache = new Map();

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

function shouldWalk(src, values, limit) {
    if (limit === 0) {
        return false;
    }
    if (src === null || typeof src !== 'object') {
        return false;
    }
    if (values.includes(src)) {
        return false;
    }
    return true;
}

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

function walk(src, dst, opts = {}, keys = [], values = []) {
    const {cb, key, limit} = handleOpts(opts);
    if (!shouldWalk(src, values, limit)) {
        return;
    }

    const props = getAllProps(src);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (ignores.includes(prop)) {
            continue;
        }

        const val = src[prop];

        const newKeys = [...keys, key(prop, val)];
        const newValues = [...values, src];
        const newOpts = {cb, key, limit: limit-1};

        walk(val, dst, newOpts, newKeys, newValues);

        cb(val, dst, newKeys);
    }
}