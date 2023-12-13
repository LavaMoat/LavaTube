const isPrimitive = (obj) => {
    return !Object.is(obj, Object(obj));
}

// When working with Proxies they can throw on any operation,
// so this wrapper of Reflect is used to catch (and ignore) any errors
// TODO: should likely collect these errors and add to graph
const ReflectTryCatch = {
    has: (target, key) => {
        try {
            return Reflect.has(target, key);
        } catch (err) {
            return false;
        }
    },
    get: (target, key, receiver) => {
        try {
            return Reflect.get(target, key, receiver);
        } catch (err) {
            return undefined;
        }
    },
    getPrototypeOf: (target) => {
        try {
            return Reflect.getPrototypeOf(target);
        } catch (err) {
            return null;
        }
    },
    ownKeys: (target) => {
        try {
            return Reflect.ownKeys(target);
        } catch (err) {
            return [];
        }
    },
    getOwnPropertyDescriptor: (target, key) => {
        try {
            return Reflect.getOwnPropertyDescriptor(target, key);
        } catch (err) {
            return undefined;
        }
    },
}

const isPromiseLike = (obj) => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        ReflectTryCatch.has(obj, 'then') &&
        typeof ReflectTryCatch.get(obj, 'then') === 'function'
    );
}

const keyToString = (key) => {
    if (typeof key === 'symbol') {
        return key.toString();
    } else {
        return `${key}`;
    }
}

const getProtoTypeChain = (target) => {
    const chain = [target];
    let proto = ReflectTryCatch.getPrototypeOf(target);
    while (proto) {
        chain.push(proto);
        proto = ReflectTryCatch.getPrototypeOf(proto);
    }
    return chain;
}

const getPrototypeChainKeys = (target) => {
    const props = [];
    const visitedKeys = new Set();
    for (const proto of getProtoTypeChain(target)) {
        for (const key of ReflectTryCatch.ownKeys(proto)) {
            const isShadowed = visitedKeys.has(key);
            props.push([proto, key, isShadowed]);

            visitedKeys.add(key);
        }
    }
    return props;
}

const getKeyStringShadowed = (key, isShadowed) => {
    if (isShadowed) {
        return `<shadowed (${keyToString(key)})>`;
    } else {
        return keyToString(key);
    }
}

const isIterator = (target) => {
    return (
        ReflectTryCatch.has(target, 'next') &&
        typeof ReflectTryCatch.get(target, 'next') === 'function'
    );
}

// We include Map and Set in addition to iterables/iterators for better key display
const getIterableValues = (target, realms) => {
    const additionalProps = [];
    // handle Map and Set
    for (const { Map, Set } of realms) {
        let isMap = false;
        let isSet = false;
        try {
            isMap = target instanceof Map;
            isSet = target instanceof Set;
        } catch (err) {
            additionalProps.push([`<instanceof error>`, err]);
        }
        if (isMap) {
            for (const [key, value] of target.entries()) {
                additionalProps.push([`<Map key (${keyToString(key)})>`, key]);
                additionalProps.push([`<Map value (${keyToString(key)})>`, value]);
            }
        } else if (isSet) {
            for (const value of target.values()) {
                additionalProps.push([`<Set value (${keyToString(value)})>`, value]);
            }
        }
    }
    // handle iterables
    if (
        ReflectTryCatch.has(target, Symbol.iterator) &&
        typeof ReflectTryCatch.get(target, Symbol.iterator) === 'function'
    ) {
        // iterable entries
        let index = 0;
        try {
            for (const entry of target) {
                additionalProps.push([`<iterable (${index})>`, entry]);
                index++;
            }
        } catch (err) {
            additionalProps.push([`<iterable error>`, err]);
            return additionalProps;
        }
        // iterator itself
        try {
            additionalProps.push([`<Symbol.iterator>`, target[Symbol.iterator]()]);
        } catch (err) {
            additionalProps.push([`<Symbol.iterator error>`, err]);
        }
    }
    // handle iterators
    if (isIterator(target)) {
        let index = 0;
        try {
            while (true) {
                const { value, done } = target.next();
                if (done) {
                    break;
                }
                additionalProps.push([`<iterator (${index})>`, value]);
                index++;
            }
        } catch (err) {
            additionalProps.push([`<iterator error>`, err]);
            return additionalProps;
        }
    }

    return additionalProps;
}

const silencePromiseRejection = (value) => {
    if (isPromiseLike(value)) {
        // ignore promise rejection warnings
        Promise.resolve(value).catch(err => {});
    }
}

const getAllProps = (target, config) => {
    const { shouldInvokeGetters, shouldCallFunctions, getAdditionalProps, realms } = config;
    const props = [];
    const proto = ReflectTryCatch.getPrototypeOf(target);
    if (proto) {
        props.push(['<prototype>', proto]);
    }
    for (const [proto, key, isShadowed] of getPrototypeChainKeys(target)) {
        const propDesc = ReflectTryCatch.getOwnPropertyDescriptor(proto, key);
        const keyString = getKeyStringShadowed(key, isShadowed);
        if (propDesc === undefined) {
            continue;
        }
        if (propDesc.set !== undefined) {
            props.push([`<setter (${keyString})>`, propDesc.set]);
        }
        let value;
        if (propDesc.get !== undefined) {
            props.push([`<getter (${keyString})>`, propDesc.get]);
            if (!shouldInvokeGetters) {
                continue;
            }
            try {
                value = ReflectTryCatch.get(proto, key, target);
            } catch (err) {
                props.push([`<get error (${keyString})>`, err]);
                continue;
            }
            props.push([`<get (${keyString})>`, value]);
        } else if (ReflectTryCatch.has(propDesc, 'value')) {
            value = propDesc.value
            props.push([keyString, value]);
        }
        // some values are getters that return promises that reject
        silencePromiseRejection(value);
    }
    if (shouldCallFunctions && typeof target === 'function') {
        try {
            const result = Reflect.apply(target, target, []);
            props.push([`<function return value>`, result]);
        } catch (err) {
            props.push([`<function error>`, err]);
        }
    }
    props.push(...getIterableValues(target, realms));
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

const makeQueueFromAppendOnlyMap = (appendOnlyMap) => {
    const iterator = appendOnlyMap.entries()
    let index = 0
    const isEmpty = () => appendOnlyMap.size === index
    const flush = function* () {
        while (!isEmpty()) {
            yield iterator.next().value
            index++
        }
    }
    return {
        flush,
        isEmpty,
    }
}

const makeWeakMapTracker = (generateKey, maxDepth, realms) => {
    const valueToPath = new Map();
    const weakMaps = new Map();

    const add = (weakMap, path, depth) => {
        // if we're at maxDepth, we dont need to track children
        if (depth === maxDepth) {
            return;
        }
        if (weakMaps.has(weakMap)) {
            return;
        }
        const queue = makeQueueFromAppendOnlyMap(valueToPath);
        weakMaps.set(weakMap, {
            queue,
            path,
            depth,
        });
    }

    const allEmpty = () => {
        for (const { queue } of weakMaps.values()) {
            if (!queue.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    function* flushAllOnce () {
        for (const [weakMap, { queue, path: weakMapPath, depth: weakMapDepth }] of weakMaps.entries()) {
            if (queue.isEmpty()) {
                continue;
            }
            const childDepth = weakMapDepth + 1;
            for (const [weakMapKey, weakMapKeyPath] of queue.flush()) {
                if (!weakMap.has(weakMapKey)) {
                    continue;
                }
                // new value found!
                const childValue = weakMap.get(weakMapKey);
                const weakMapChildKey = `<WeakMap value (${weakMapKeyPath})>`;
                const childPath = [...weakMapPath, generateKey(weakMapChildKey, childValue)];
                yield [childValue, childPath, childDepth]
            }
        }
    }

    // flushing queues can result in queues being repopulated
    // so we need to keep flushing until all queues are empty
    function* flushAll () {
        while (!allEmpty()) {
            yield* flushAllOnce()
        }
    }

    const visitValue = (value, path, depth) => {
        valueToPath.set(value, path);
        for (const { WeakMap } of realms) {
            if (value instanceof WeakMap) {
                add(value, path, depth);
            }
        }
    }

    return {
        add,
        visitValue,
        flushAll,
    }
}

function* iterateAndTrack (subTree, tracker) {
    for (const [value, path, depth] of subTree) {
        yield [value, path, depth];
        tracker.visitValue(value, path, depth);
    }
}

const makeConfig = ({
    shouldInvokeGetters = true,
    shouldCallFunctions = false,
    shouldBruteForceWeakMaps = false,
    shouldWalk = () => true,
    maxDepth = Infinity,
    depthFirst = false,
    getAdditionalProps = () => [],
    realms = [{ Map, Set, WeakMap }],
    generateKey = (key, value) => key,
} = {}) => {
    return {
        shouldInvokeGetters,
        shouldCallFunctions,
        shouldBruteForceWeakMaps,
        shouldWalk,
        maxDepth,
        depthFirst,
        getAdditionalProps,
        realms,
        generateKey,
    };
}

function* walkIterativelyEntry (target, opts, visited = new Set(), path = []) {
    const depth = 0
    const config = makeConfig(opts);

    if (!shouldVisit(target, visited, config.shouldWalk)) {
        return;
    }

    yield [target, path];

    let tracker;
    if (config.shouldBruteForceWeakMaps) {
        tracker = makeWeakMapTracker(config.generateKey, config.maxDepth, config.realms);
        tracker.visitValue(target, path, depth);
    }

    const subTree = walkIteratively(target, config, depth, visited, path);
    if (config.shouldBruteForceWeakMaps) {
        yield* iterateAndTrack(subTree, tracker)
        // check for any values found inside the collected weakMaps
        // as we discover and walk them, new WeakMaps and references may be discovered
        // the weakMapTracker will continue to iterate them until they are exhausted
        for (const [childValue, childPath, childDepth] of tracker.flushAll()) {
            if (!shouldVisit(childValue, visited, config.shouldWalk)) {
                continue;
            }
            yield [childValue, childPath, childDepth];
            tracker.visitValue(childValue, childPath, childDepth);
            const weakMapValueSubTree = walkIteratively(childValue, config, childDepth, visited, childPath);
            yield* iterateAndTrack(weakMapValueSubTree, tracker);
        }
    } else {
        yield* subTree;
    }
}

const walkIteratively = function*(target, config, depth, visited, path) {
    if (depth === config.maxDepth) {
        return;
    }

    const deferredSubTrees = [];
    const props = getAllProps(target, config);
    const childDepth = depth + 1;
    for (const [key, childValue] of props) {
        if (!shouldVisit(childValue, visited, config.shouldWalk)) {
            continue;
        }
        const childPath = [...path, config.generateKey(key, childValue)];
        yield [childValue, childPath, childDepth];
        const subTreeIterator = walkIteratively(childValue, config, childDepth, visited, childPath);
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

//
// Public API
//

/** @typedef {any[]} Path */
/** @typedef {[any, Path]} IterationResult */
/** @typedef {Record<{ value: any, path: Path }>} WalkResult */

/**
 * Iterates over the target object and its nested properties.
 * @param {any} start - The target value to iterate over.
 * @param {Object} [opts] - LavaTube configuration options.
 * @returns {Iterable<IterationResult>} - An iterable that yields [value, path] pairs.
 */
export const iterate = (start, opts) => {
    return walkIterativelyEntry(start, opts);
}

/**
 * Walks through the target object and its nested properties, invoking a visitor function on each value.
 * @param {any} start - The target value to walk through.
 * @param {Function} visitorFn - The visitor function to invoke on each value. Return true to stop iteration and return current value.
 * @param {Object} [opts] - LavaTube configuration options.
 * @returns {WalkResult|undefined} - The first value and its path that satisfies the visitor function, or undefined if not found.
 */
export const walk = (start, visitorFn, opts) => {
    for (const [value, path] of walkIterativelyEntry(
        start,
        opts,
    )) {
        if (visitorFn(value, path)) {
            return { value, path };
        }
    }
    return undefined;
}

/**
 * Retrieves all values from the target object and its nested properties.
 * @param {any} start - The target value to retrieve values from.
 * @param {Object} [opts] - LavaTube configuration options.
 * @returns {Array<any>} - An array containing all the values.
 */
export const getAllValues = (start, opts) => {
    const results = [];
    walk(start, (value) => {
        results.push(value);
    }, opts);
    return results;
}

/**
 * Finds the path to the specified target value in the target object and its nested properties.
 * @param {any} start - The target value to search in.
 * @param {any} target - The value to search for.
 * @param {Object} [opts] - LavaTube configuration options.
 * @returns {Path|undefined} - The path to the target value, or undefined if not found.
 */
export const find = (start, target, opts) => {
    const result = walk(start, (value) => {
        if (value === target) {
            return true;
        }
    }, opts);
    if (result !== undefined) {
        return result.path;
    }
    return undefined;
}

export default {
    iterate,
    walk,
    getAllValues,
    find,
}
