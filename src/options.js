function options(opts = {}) {
    if (typeof opts.generateKey !== 'function') {
        opts.generateKey = (prop, val) => `${({}).toString.call(val)}:${prop}`;
    }
    if (typeof opts.maxRecursionLimit !== 'number') {
        opts.maxRecursionLimit = 5;
    }
    if (!(opts.avoidPropertiesCache = Boolean(opts.avoidPropertiesCache))) {
        if (typeof opts.propertiesCacheMap !== 'object') {
            opts.propertiesCacheMap = new Map();
        }
    }
    if (!(opts.avoidValuesCache = Boolean(opts.avoidValuesCache))) {
        if (typeof opts.valuesCacheSet !== 'object') {
            opts.valuesCacheSet = new Set();
        }
    }
    return opts;
}

module.exports = options;