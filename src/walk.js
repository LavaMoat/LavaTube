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

function walk(obj, cb, opts = {}, keys = [], values = []) {
    const {key, limit} = options(opts);
    if (!shouldWalk(obj, values, limit)) {
        return false;
    }
    const props = getAllProps(obj);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (shouldIgnore(prop, obj, values)) {
            continue;
        }
        let stop;
        const val = obj[prop];
        const newKeys = [...keys, key(prop, val)];
        const newValues = [...values, obj];
        const newOpts = {key, limit: limit - 1};
        stop = walk(val, cb, newOpts, newKeys, newValues);
        if (stop) return true;
        stop = cb(val, newKeys);
        if (stop) return true;
    }
    return false;
}

module.exports = walk;