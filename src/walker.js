const shouldIgnore = require('./ignores');
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

Walker.prototype.shouldWalk = function(obj, limit) {
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
}

Walker.prototype.walkRecursively = function(obj, limit, keys = [], values = []) {
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
}

function Walker(cb, {
                    generateKey,
                    onShouldIgnoreError,
                    avoidValuesCache,
                    avoidPropertiesCache,
                    valuesCacheSet,
                    propertiesCacheMap,
                    maxRecursionLimit,
                }) {
    if (typeof cb !== 'function') {
        throw new Error(`@cb must be a function, instead got a "${typeof cb}"`);
    }
    if (typeof generateKey !== 'function') {
        generateKey = (prop, val) => `${({}).toString.call(val)}:${prop}`;
    }
    if (typeof onShouldIgnoreError !== 'function') {
        onShouldIgnoreError = (prop, obj, error) => { throw error };
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

Walker.prototype.walk = function(start) {
    return this.walkRecursively(start, this.maxRecursionLimit);
}

module.exports = Walker;