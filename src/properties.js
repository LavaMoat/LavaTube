function getAllPropsFromCache(obj, cache) {
    if (!cache) {
        return Object.getOwnPropertyNames(obj);
    }
    let ownProps = cache.get(obj);
    if (!ownProps) {
        ownProps = Object.getOwnPropertyNames(obj);
        cache.set(obj, ownProps);
    }
    return ownProps;
}

function getAllProps(obj, cache, props = []) {
    if (!obj) {
        return props;
    }
    props = [...props, ...getAllPropsFromCache(obj, cache)];
    return getAllProps(Object.getPrototypeOf(obj), cache, props);
}

module.exports = getAllProps;