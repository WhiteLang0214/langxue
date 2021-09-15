# ref

## 字符串形式的 ref

- 组件内的标签可以通过 ref 来标识自己

```js

class Refdemo extends React.Component{

    showData = () => {
        const { input } = this.$refs;
        alert(input.value)
    }

    render() {
        return (
            <div>
                <input ref="input" placeholder="ref，点击获取当前输入内容" />
                <button onClick={this.showData}></button>
            </div>
        )
    }
}
ReactDOM.render(<Refdemo />, document.getElementById('root'))
```

## 回调形式的 ref

```js

class Refdemo extends React.Component{

    showData = () => {
        const { input } = this;
        alert(input.value)
    }

    bindInput = (c) => {
        this.input = c;
        console.log('c')
    }

    render() {
        return (
            <div>
                /* 内联函数的方式 */
                <input ref={ currentNode => this.input = currentNode} placeholder="ref，点击获取当前输入内容" />
                /* class 的绑定函数的方式 */
                <input ref={this.bindInput} />
                <button onClick={this.showData}></button>
            </div>
        )
    }
}
ReactDOM.render(<Refdemo />, document.getElementById('root'))
```

- tips
    + 如果 ref 回调函数是以内联函数的方式定义的，在更新过程中它会被执行两次，第一次传入参数 null，然后第二次会传入参数 DOM 元素。因为在每次渲染时会创建一个新的函数实例，所以 React 清空旧的 ref 并且设置新的

    + 通过将 ref 的回调函数定义成 class 的绑定函数的方式可以避免上述问题，但是大多数情况下它是<b>无关紧要</b>的。

## React.createRef

- 通过 `React.createRef()` 创建一个 ref 来存储 inputRef 的 DOM 元素

- 通过 "current" 来访问 DOM 节点


```js

class Refdemo extends React.Component{

    showData = () => {
        const { current } = this.inputRef;
        alert(current.value)
    }

    inputRef = React.createRef()
    inputRef1 = React.createRef()

    render() {
        return (
            <div>
                <input ref={this.inputRef} placeholder="ref，点击获取当前输入内容" />
                <input ref={this.inputRef1} />
                <button onClick={this.showData}></button>
            </div>
        )
    }
}
ReactDOM.render(<Refdemo />, document.getElementById('root'))
```

## 事件处理

- 事件委托方式，委托给组件的最外层元素 为了高校

- 通过 event.target 得到发生事件的 DOM 元素对象

- 在 React 中另一个不同点是你不能通过返回 false 的方式阻止默认行为。你必须显式的使用 preventDefault
