const cache = new Map();

function getAllPropsFromCache(obj) {
    let ownProps = cache.get(obj);
    if (!ownProps) {
        ownProps = Object.getOwnPropertyNames(obj);
        cache.set(obj, ownProps);
    }
    return ownProps;
}

function getAllProps(obj, props = []) {
    if (!obj) {
        return props;
    }
    props = [...props, ...getAllPropsFromCache(obj)];
    return getAllProps(Object.getPrototypeOf(obj), props);
}

module.exports = getAllProps;