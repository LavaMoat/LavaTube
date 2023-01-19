const walk = require('./walk');

module.exports = function(obj, dst, opts = {}, keys = [], values = []) {
    return walk(obj, dst, opts, keys, values);
};