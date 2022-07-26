# walker
walk through the proto chain

## demo

check out the [demo](./demo)

## findings

### `ownerDocument` property

this property is owned by `Node` prototype, therefore anyone with access to a decedent of `Node` can access it.
it's hard telling all the options to get a hold on an object that its prototype is `Node`, which makes this game tricky.

might be a comprehensive list though: [doc]([https://developer.mozilla.org/en-US/docs/Web/API/Node](https://dom.spec.whatwg.org/#concept-node)):

```javascript
doc = 
  document.createElement('x').ownerDocument   ||
  document.createAttribute('x').ownerDocument ||
  new Text().ownerDocument                    ||
  new Comment().ownerDocument                 
```

> TODO: think of a way to map all possibilities that inherit from `Node` in order to understand the problem better

### Events

another cool way to get a hold on document/window is through the event object that is passed to listeners by the browser:

```javascript
window.addEventListener('mousemove', function (ev) {
  win = 
    ev.currentTarget            || 
    ev.path[ev.path.length - 1]
  doc = 
    win.document                ||
    ev.target.ownerDocument     ||
    ev.srcElement.ownerDocument ||
})
```

because `Event` inherits from `Node` as well.

> TODO: think of a way to handle events so they won't leak such information
