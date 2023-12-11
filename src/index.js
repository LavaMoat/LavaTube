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

const walkIterativelyPublic = (target, config, maxDepth, visited = new WeakSet(), path = []) => {
    return walkIteratively(target, config, maxDepth, visited, path);
}

const walkIteratively = function*(target, config, maxDepth, visited, path) {
    if (isPrimitive(target)) {
        return;
    }
    
    if (visited.has(target)) {
        return;
    }
    visited.add(target);

    if (!config.shouldWalk(target)) {
        return;
    }

    yield [target, path];

    if (maxDepth === 0) {
        return;
    }

    const props = getAllProps(target, config.shouldInvokeGetters);
    for (const [key, value] of props) {
        const childPath = [...path, config.generateKey(key, value)];
        yield* walkIteratively(value, config, maxDepth - 1, visited, childPath);
    }
}

const defaultGenerateKey = (key, value) => {
    const keyString = keyToString(key);
    const valueString = Object.prototype.toString.call(value);
    return `${valueString}:${keyString}`;
}
class LavaTube {
    constructor({
        generateKey = defaultGenerateKey,
        shouldInvokeGetters = true,
        maxRecursionLimit = Infinity,
        shouldWalk = () => true,
    } = {}) {
        this.config = {
            shouldWalk,
            shouldInvokeGetters,
            generateKey,
        };
        this.maxRecursionLimit = maxRecursionLimit;
        this.visitedSet = new WeakSet();
    }

    walk (start, visitorFn) {
        for (const [val, keys] of walkIterativelyPublic(
            start,
            this.config,
            this.maxRecursionLimit,
            this.visitedSet
        )) {
            if (visitorFn(val, keys)) {
                return true;
            }
        }
    }
}

module.exports = LavaTube;