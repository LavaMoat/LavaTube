const getAllProps = require('./properties');

function isPrimitive(obj) {
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

const walkIteratively = function*(target, config, limit, path = []) {
  yield [target, path];
  if (isPrimitive(obj)) {
    return;
  }
  if (limit === 0) {
      return;
  }
  if (!config.shouldWalk(target)) {
      return;
  }
  const cache = !config.avoidPropertiesCache && config.propertiesCacheMap;
  const props = getAllProps(target, cache);
  for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      let value;
      try {
          value = target[prop];
      } catch (err) {
          // TODO: we should walk the error
          continue;
      }
      if (isPromiseLike(value)) {
          // ignore promise rejections
          Promise.resolve(value).catch(err => {});
      }
      const childPath = [...path, config.generateKey(prop, value)];
      yield* walkIteratively(value, config, limit - 1, childPath);
  }
}

LavaTube.prototype.shouldWalk = function(obj) {
    if (this.avoidValuesCache) {
        return true;
    }
    if (this.valuesCacheSet.has(obj)) {
        return false;
    }
    this.valuesCacheSet.add(obj);
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
    const config = {
        shouldWalk: this.shouldWalk.bind(this),
        generateKey: this.generateKey,
        avoidPropertiesCache: this.avoidPropertiesCache,
        propertiesCacheMap: this.propertiesCacheMap,
    };
    for (const [val, keys] of walkIteratively(start, config, this.maxRecursionLimit)) {
        if (visitorFn(val, keys)) {
            return true;
        }
    }
}

module.exports = LavaTube;