const walk = require('./walk');

module.exports = function(start, cb, opts = {}) {
    if (typeof cb !== 'function') {
        throw new Error(`@cb must be a function, instead got a "${typeof cb}"`);
    }
    return walk(start, cb, opts);
};