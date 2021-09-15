# props

- 只读 所有 React 组件都必须像纯函数一样保护它们的 props 不被更改。

- 如果在构造器中访问到 this.props，则  constructor 和 super 一定要传props

- 展开运算符批量传递数据

```js
ReactDOM.render(<Props1 {...{name: 'tom', age: 12}} />, root)
```

- 对组件传递的标签属性做限制 propTypes

```js
static propTypes = {
    name: PropTypes.string, // 字符串格式
    age: PropTypes.number.isRequired, // age 必传
    name: PropTypes.func, // 传方法
}

static defaultProps = { // 默认值
    name: 'tom'
}

```

# 函数式组件

- 只有 props，不存在 refs,state，如果函数式组件想使用 state，使用 hooks

```js
function Funccom(props) {
    return (
        <div>函数组件-{props.name}:{props.age}</div>
    )
}

// 传值限制
Funccom.defaultProps = {
    sex: '女'
}

Funccom.propTypes = {
    name: PropTypes.string
}

ReactDOM.render(<Funccom {...{name: 'tom', age: 12}} />, root)
```
