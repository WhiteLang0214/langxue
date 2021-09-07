# 虚拟 DOM

- 本质是 Object 的对象（一般对象）
- 真实 DOM 的属性多，虚拟 DOM 的属性少。因为 虚拟 DOM 是 react 内部用，无需那么多的属性
- 虚拟 DOM 最终会被 react 转化为真实 DOM，呈现在页面上

```html
<div id="demo></div>
```

```js

const vdom = (
    <div id="hello">
        <span>hello world</span>
    </div>
)

const pdom = document.getElementById('demo)
ReactDOM.render(vdom, pdom)

```