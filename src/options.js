function options(opts = {}) {
    if (typeof opts.cb !== 'function') {
        throw new Error(`@options.cb must be a function, instead got a "${typeof opts.cb}"`);
    }
    if (typeof opts.key !== 'function') {
        opts.key = (prop, val) => `${({}).toString.call(val)}:${prop}`;
    }
    if (typeof opts.limit !== 'number') {
        opts.limit = 5;
    }
    return opts;
}

module.exports = options;