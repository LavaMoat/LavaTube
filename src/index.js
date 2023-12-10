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

const isPromiseLike = (obj) => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'then' in obj &&
        typeof obj.then === 'function'
    );
}

LavaTube.prototype.shouldWalk = function(obj, limit) {
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

LavaTube.prototype.walkRecursively = function(obj, visitorFn, limit, keys = [], values = []) {
    if (!this.shouldWalk(obj, limit)) {
        return false;
    }
    const cache = !this.avoidPropertiesCache && this.propertiesCacheMap;
    const props = getAllProps(obj, cache);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        let value;
        try {
            value = obj[prop];
        } catch (err) {
            // TODO: we should walk the error
            continue;
        }
        if (isPromiseLike(value)) {
            // ignore promise rejections
            Promise.resolve(value).catch(err => {});
        }
        const newKeys = [...keys, this.generateKey(prop, value)];
        const newValues = [...values, obj];
        if (
            this.walkRecursively(value, visitorFn, limit - 1, newKeys, newValues)
            || visitorFn(value, newKeys)
        ) {
            return true;
        }
    }
    return false;
}

LavaTube.prototype.walkIteratively = function*(obj, limit, keys = [], values = []) {
    yield [obj, keys];
    if (!this.shouldWalk(obj, limit)) {
        return;
    }
    const cache = !this.avoidPropertiesCache && this.propertiesCacheMap;
    const props = getAllProps(obj, cache);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        let value;
        try {
            value = obj[prop];
        } catch (err) {
            // TODO: we should walk the error
            continue;
        }
        if (isPromiseLike(value)) {
            // ignore promise rejections
            Promise.resolve(value).catch(err => {});
        }
        const newKeys = [...keys, this.generateKey(prop, value)];
        const newValues = [...values, obj];
        
        yield* this.walkIteratively(value, limit - 1, newKeys, newValues);
    }
}

function LavaTube({
                    generateKey,
                    onShouldIgnoreError,
                    avoidValuesCache,
                    avoidPropertiesCache,
                    valuesCacheSet,
                    propertiesCacheMap,
                    maxRecursionLimit,
                } = {}) {
    if (typeof generateKey !== 'function') {
        generateKey = (prop, val) => `${Object.prototype.toString.call(val)}:${prop}`;
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
    this.generateKey = generateKey;
    this.onShouldIgnoreError = onShouldIgnoreError;
    this.avoidValuesCache = avoidValuesCache;
    this.avoidPropertiesCache = avoidPropertiesCache;
    this.valuesCacheSet = valuesCacheSet;
    this.propertiesCacheMap = propertiesCacheMap;
    this.maxRecursionLimit = maxRecursionLimit;
}

LavaTube.prototype.walk = function(start, visitorFn) {
    return this.walkRecursively(start, visitorFn, this.maxRecursionLimit);
    // for (const [val, keys] of this.walkIteratively(start, this.maxRecursionLimit)) {
    //     if (visitorFn(val, keys)) {
    //         return true;
    //     }
    // }
}

module.exports = LavaTube;