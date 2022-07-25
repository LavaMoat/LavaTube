const ignores = ['__proto__'];

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
    return getAllProps(Object.getPrototypeOf(obj), props)
}

function walk(src, dst, cb, xxx, limit = 10000, keys = [], values = []) {
    if (limit === 0) {
        return;
    }
    if (src === null || typeof src !== 'object') {
        return;
    }
    if (values.slice(0, -1).includes(src)) {
        return;
    }
    const props = getAllProps(src);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (ignores.includes(prop)) {
            continue;
        }
        const val = src[prop];
        const newKeys = [...keys, xxx(prop, val)];
        const newValues = [...values, src];
        walk(val, dst, cb, xxx, limit-1, newKeys, newValues);
        cb(val, dst, newKeys);
    }
}