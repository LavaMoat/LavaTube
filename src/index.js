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

const getAllProps = (target, shouldInvokeGetters, getAdditionalProps) => {
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
            if (propDesc.set !== undefined) {
                props.push([`<set ${keyToString(key)}>`, propDesc.set]);
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
            props.push([`<get error ${keyToString(key)}>`, err]);
            continue;
        }
    }
    const additionalProps = getAdditionalProps(target);
    if (additionalProps.length > 0) {
        props.push(...additionalProps);
    }
    return props;
}

const shouldVisit = (target, visited, shouldWalk) => {
    if (isPrimitive(target)) {
        return false;
    }

    if (visited.has(target)) {
        return false;
    }
    visited.add(target);

    if (!shouldWalk(target)) {
        return false;
    }

    return true;
}

function* walkIterativelyPublic (target, config, maxDepth, visited = new WeakSet(), path = []) {
    if (!shouldVisit(target, visited, config.shouldWalk)) {
        return;
    }

    yield [target, path];

    yield* walkIteratively(target, config, maxDepth, visited, path);
}

const walkIteratively = function*(target, config, maxDepth, visited, path) {
    if (maxDepth === 0) {
        return;
    }

    const deferredSubTrees = [];
    const props = getAllProps(target, config.shouldInvokeGetters, config.getAdditionalProps);
    for (const [key, childValue] of props) {
        const childPath = [...path, config.generateKey(key, childValue)];
        if (!shouldVisit(childValue, visited, config.shouldWalk)) {
            continue;
        }
        yield [childValue, childPath];
        const subTreeIterator = walkIteratively(childValue, config, maxDepth - 1, visited, childPath);
        if (config.depthFirst) {
            yield* subTreeIterator;
        } else {
            deferredSubTrees.push(subTreeIterator);
        }
    }
    for (const subTree of deferredSubTrees) {
        yield* subTree;
    }
}

const defaultGenerateKey = (key, value) => {
    const keyString = keyToString(key);
    const valueString = Object.prototype.toString.call(value);
    return `${valueString}:${keyString}`;
}

const defaultGetAdditionalProps = (target) => {
    const additionalProps = [];
    if (target instanceof Map) {
        for (const [key, value] of target.entries()) {
            additionalProps.push([`<map key ${keyToString(key)}>`, key]);
            additionalProps.push([`<map value ${keyToString(key)}>`, value]);
        }
    } else if (target instanceof Set) {
        for (const value of target.values()) {
            additionalProps.push([`<set value ${keyToString(value)}>`, value]);
        }
    }
    return additionalProps;
}

export default class LavaTube {
    constructor({
        generateKey = defaultGenerateKey,
        shouldInvokeGetters = true,
        maxRecursionLimit = Infinity,
        shouldWalk = () => true,
        getAdditionalProps = defaultGetAdditionalProps,
        depthFirst = false,
    } = {}) {
        this.config = {
            depthFirst,
            shouldWalk,
            shouldInvokeGetters,
            generateKey,
            getAdditionalProps,
        };
        this.maxRecursionLimit = maxRecursionLimit;
        this.visitedSet = new WeakSet();
    }

    walk (start, visitorFn) {
        for (const [value, path] of walkIterativelyPublic(
            start,
            this.config,
            this.maxRecursionLimit,
            this.visitedSet
        )) {
            if (visitorFn(value, path)) {
                return true;
            }
        }
    }

    iterate (start) {
        return walkIterativelyPublic(
            start,
            this.config,
            this.maxRecursionLimit,
            this.visitedSet
        );
    }
}
