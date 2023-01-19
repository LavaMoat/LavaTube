const shouldIgnore = require('./ignores');
const options = require('./options');
const getAllProps = require('./properties');

function shouldWalk(obj, values, limit) {
    if (limit === 0) {
        return false;
    }
    if (obj === null || typeof obj !== 'object') {
        return false;
    }
    if (values.includes(obj)) {
        return false;
    }
    return true;
}

function walk(obj, dst, opts = {}, keys = [], values = []) {
    const {cb, key, limit} = options(opts);
    if (!shouldWalk(obj, values, limit)) {
        return;
    }
    const props = getAllProps(obj);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (shouldIgnore(prop, obj, keys, values)) {
            continue;
        }
        const val = obj[prop];
        const newKeys = [...keys, key(prop, val)];
        const newValues = [...values, obj];
        const newOpts = {cb, key, limit: limit - 1};
        walk(val, dst, newOpts, newKeys, newValues);
        cb(val, dst, newKeys);
    }
}

module.exports = walk;