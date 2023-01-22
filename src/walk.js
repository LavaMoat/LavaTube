const shouldIgnore = require('./ignores');
const options = require('./options');
const getAllProps = require('./properties');

function isPrimitive(obj) {
    if (obj === null) {
        return true;
    }
    const type = typeof obj;
    return (
        type === 'bigint' ||
        type === 'boolean' ||
        type === 'number' ||
        type === 'string'
    );

}

function shouldWalk(obj, values, opts = {}) {
    if (isPrimitive(obj)) {
        return false;
    }
    const {
        avoidValuesCache,
        valuesCacheSet,
        maxRecursionLimit,
    } = options(opts);
    if (maxRecursionLimit === 0) {
        return false;
    }
    if (avoidValuesCache) {
        return true;
    }
    if (valuesCacheSet.has(obj)) {
        return false;
    }
    valuesCacheSet.add(obj);
    return true;
}

function walk(obj, cb, opts = {}, keys = [], values = []) {
    const {
        generateKey,
        avoidValuesCache,
        avoidPropertiesCache,
        valuesCacheSet,
        propertiesCacheMap,
        maxRecursionLimit,
    } = options(opts);
    if (!shouldWalk(obj, values, {avoidValuesCache, valuesCacheSet, maxRecursionLimit})) {
        return false;
    }
    const props = getAllProps(obj, !avoidPropertiesCache && propertiesCacheMap);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (shouldIgnore(prop, obj, values)) {
            continue;
        }
        const val = obj[prop];
        const newKeys = [...keys, generateKey(prop, val)];
        const newValues = [...values, obj];
        const newOpts = {
            generateKey,
            avoidValuesCache,
            avoidPropertiesCache,
            valuesCacheSet,
            propertiesCacheMap,
            maxRecursionLimit,
        };
        newOpts.maxRecursionLimit -= 1;
        if (walk(val, cb, newOpts, newKeys, newValues) || cb(val, newKeys)) {
            return true;
        }
    }
    return false;
}

module.exports = walk;