# jsx

- 一个 JavaScript 的语法扩展，全程 javascript XML。

- 本质是 React.createElement(component, props, ...children) 语法糖

- 作用：用于简化创建虚拟 DOM

- 规则
    1. 定义 虚拟DOM 时，不要写引号
    2. 标签内引入 js 语法时，使用花括号 {}
    3. 样式的类名指定应 使用 className
    4. 标签内写内联样式 使用 双花括号 {{}} style={{key: value}}
    5. 虚拟DOM 有且只有一个根标签
    6. 标签必须闭合
    7. 标签首字母
        + 若小写字母开头，则将转化为html中同名标签；若html中无同名标签，则报错
        + 若大写字母开头，则 react 会渲染对应的组件，若组件没定义，则报错 xxx is not defined

```css
.color {
    color: '#3b9ce0'
}
```

```js
function clickFunc() {
    console.log('点击了 input')
}
```

```js
const myID = 'hello';
const myCont = 'hello world';

// 定义虚拟dom
const vdom = (
    <div id={myID}>
        <span className={color} style={{'fontSize': '24px'}}>{myCont}</span>
        <input onclick={clickFunc} />
    </div>
)

// 渲染到页面
const pdom = document.getElementById('demo')
ReactDOM.render(vdom, pdom)

```

## JSX 防止注入攻击

- React DOM 在渲染所有输入内容之前，默认会进行转义。它可以确保在你的应用中，永远不会注入那些并非自己明确编写的内容。所有的内容在渲染之前都被转换成了字符串。这样可以有效地防止 XSS（cross-site-scripting, 跨站脚本）攻击。