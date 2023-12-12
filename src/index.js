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

const makeWeakMapTracker = (generateKey) => {
    const valueToPath = new Map();
    const weakMaps = new Map();

    const add = (weakMap, path, maxDepth) => {
        if (weakMaps.has(weakMap)) {
            return;
        }
        const queue = makeQueueFromAppendOnlyMap(valueToPath);
        weakMaps.set(weakMap, {
            queue,
            path,
            maxDepth,
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
        for (const [weakMap, { queue, path: weakMapPath, maxDepth: weakMapMaxDepth }] of weakMaps.entries()) {
            if (queue.isEmpty()) {
                continue;
            }
            for (const [weakMapKey, weakMapKeyPath] of queue.flush()) {
                if (!weakMap.has(weakMapKey)) {
                    continue;
                }
                // new value found!
                const childValue = weakMap.get(weakMapKey);
                const weakMapChildKey = `<weakmap key (${weakMapKeyPath})>`;
                const childPath = [...weakMapPath, generateKey(weakMapChildKey, childValue)];
                const childMaxDepth = weakMapMaxDepth - 1;
                yield [childValue, childPath, childMaxDepth]
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

    const visitValue = (value, path, maxDepth) => {
        valueToPath.set(value, path);
        if (value instanceof WeakMap) {
            add(value, path, maxDepth);
        }
    }

    return {
        add,
        visitValue,
        flushAll,
    }
}

function* iterateAndTrack (subTree, tracker) {
    for (const [value, path, maxDepth] of subTree) {
        yield [value, path, maxDepth];
        tracker.visitValue(value, path, maxDepth);
    }
}


function* walkIterativelyPublic (target, config, maxDepth, visited = new Set(), path = []) {
    if (!shouldVisit(target, visited, config.shouldWalk)) {
        return;
    }

    yield [target, path];

    let tracker;
    if (config.exhaustiveWeakMapSearch) {
        tracker = makeWeakMapTracker(config.generateKey);
        tracker.visitValue(target, path, maxDepth);
    }

    const subTree = walkIteratively(target, config, maxDepth, visited, path);
    if (config.exhaustiveWeakMapSearch) {
        yield* iterateAndTrack(subTree, tracker)
        // check for any values found inside the collected weakMaps
        // as we discover and walk them, new WeakMaps and references may be discovered
        // the weakMapTracker will continue to iterate them until they are exhausted
        for (const [childValue, childPath, childMaxDepth] of tracker.flushAll()) {
            yield [childValue, childPath, childMaxDepth];
            tracker.visitValue(childValue, childPath, childMaxDepth);
            const weakMapValueSubTree = walkIteratively(childValue, config, childMaxDepth, visited, childPath);
            yield* iterateAndTrack(weakMapValueSubTree, tracker);
        }
    } else {
        yield* subTree;
    }
}

const walkIteratively = function*(target, config, maxDepth, visited, path) {
    if (maxDepth === 0) {
        return;
    }

    const deferredSubTrees = [];
    const props = getAllProps(target, config.shouldInvokeGetters, config.getAdditionalProps);
    const childMaxDepth = maxDepth - 1;
    for (const [key, childValue] of props) {
        const childPath = [...path, config.generateKey(key, childValue)];
        if (!shouldVisit(childValue, visited, config.shouldWalk)) {
            continue;
        }
        yield [childValue, childPath, childMaxDepth];
        const subTreeIterator = walkIteratively(childValue, config, childMaxDepth, visited, childPath);
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
        generateKey = (key, value) => key,
        shouldInvokeGetters = true,
        maxRecursionLimit = Infinity,
        shouldWalk = () => true,
        getAdditionalProps = defaultGetAdditionalProps,
        depthFirst = false,
        exhaustiveWeakMapSearch = false,
    } = {}) {
        this.config = {
            depthFirst,
            shouldWalk,
            shouldInvokeGetters,
            generateKey,
            getAdditionalProps,
            exhaustiveWeakMapSearch,
        };
        this.maxRecursionLimit = maxRecursionLimit;
    }

    walk (start, visitorFn) {
        for (const [value, path] of walkIterativelyPublic(
            start,
            this.config,
            this.maxRecursionLimit,
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
        );
    }
}
