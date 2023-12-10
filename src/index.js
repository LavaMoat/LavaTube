const isPrimitive = (obj) => {
    return !Object.is(obj, Object(obj));
}

const isPromiseLike = (obj) => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'then' in obj &&
        typeof obj.then === 'function'
    );
}

const keyToString = (key) => {
    if (typeof key === 'symbol') {
        return key.toString();
    } else {
        return Object.prototype.toString.call(key);
    }
}

const getProtoTypeChain = (target) => {
    const chain = [target];
    let proto = Reflect.getPrototypeOf(target);
    while (proto) {
        chain.push(proto);
        proto = Reflect.getPrototypeOf(proto);
    }
    return chain;
}

const getPrototypeChainKeys = (target) => {
    const props = [];
    const visitedKeys = new Set();
    for (const proto of getProtoTypeChain(target)) {
        for (const key of Reflect.ownKeys(proto)) {
            if (visitedKeys.has(key)) {
                continue;
            }
            props.push([proto, key]);
        }
    }
    return props;
}

const getAllProps = (target, shouldInvokeGetters) => {
    const props = [];
    const proto = Reflect.getPrototypeOf(target);
    if (proto) {
        props.push(['<prototype>', proto]);
    }
    for (const [proto, key] of getPrototypeChainKeys(target)) {
        let value
        try {
            const propDesc = Reflect.getOwnPropertyDescriptor(proto, key);
            if (propDesc === undefined) {
                continue;
            }
            if (propDesc.get !== undefined) {
                props.push([`<get ${keyToString(key)}>`, propDesc.get]);
                if (!shouldInvokeGetters) {
                    continue;
                }
            }
            value = Reflect.get(proto, key, target);
            // some values are getters that return promises that reject
            if (isPromiseLike(value)) {
                // ignore promise rejection warnings
                Promise.resolve(value).catch(err => {});
            }
            props.push([key, value]);
        } catch (err) {
            props.push([`<get ${keyToString(key)} error>`, err]);
            continue;
        }
    }
    return props;
}

const walkIteratively = function*(target, config, limit, visited = new WeakSet(), path = []) {
    if (isPrimitive(target)) {
        return;
    }
    if (visited.has(target)) {
        return;
    }
    visited.add(target);

    yield [target, path];

    if (limit === 0) {
        return;
    }
    if (!config.shouldWalk(target)) {
        return;
    }

    const props = getAllProps(target, config.shouldInvokeGetters);
    for (const [key, value] of props) {
        const childPath = [...path, config.generateKey(key, value)];
        yield* walkIteratively(value, config, limit - 1, visited, childPath);
    }
}

LavaTube.prototype.shouldWalk = function(obj) {
    if (this.avoidValuesCache) {
        return true;
    }
    return true;
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
        generateKey = (key, value) => {
            const keyString = keyToString(key);
            const valueString = Object.prototype.toString.call(value);
            return `${valueString}:${keyString}`;
        }
    }
    if (typeof onShouldIgnoreError !== 'function') {
        onShouldIgnoreError = (prop, obj, error) => { throw error };
    }
    if (typeof maxRecursionLimit !== 'number') {
        maxRecursionLimit = Infinity;
    }
    if (!(avoidPropertiesCache = Boolean(avoidPropertiesCache))) {
        if (typeof propertiesCacheMap !== 'object') {
            propertiesCacheMap = new Map();
        }
    }
    if (!(avoidValuesCache = Boolean(avoidValuesCache))) {
        if (typeof valuesCacheSet !== 'object') {
            valuesCacheSet = new WeakSet();
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
    const config = {
        shouldWalk: this.shouldWalk.bind(this),
        generateKey: this.generateKey,
        shouldInvokeGetters: true,
    };
    for (const [val, keys] of walkIteratively(
        start,
        config,
        this.maxRecursionLimit,
        this.valuesCacheSet
    )) {
        if (visitorFn(val, keys)) {
            return true;
        }
    }
}

module.exports = LavaTube;