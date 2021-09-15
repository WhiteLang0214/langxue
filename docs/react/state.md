# state

- state 是组件对象中最重要的概念，值必须是对象 { key: value } 形式

- 组件就是一个状态机，通过更新组件的 state 来更新对应页面，重新渲染

- 组件中 render 中的 this 指向实例对象

- 组件自定义的方法中 this 指向 undefined，因为 开启了 use strict。
    + 通过 bind 强制绑定 this
    + 箭头函数的 this 指向上一个 函数中的 this

- 状态数据不能直接修改，需通过 setState 更新数据

```js

class Democlass1 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '组件'
        }

        // 为了在回调中使用 `this`，这个绑定是必不可少的
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            name: '更改了名字'
        })
    }

        
    render() {
        return (<div>Democlass {this.state.name} --- 
            <button onClick={this.handleClick}>更改名字</button>
        </div>)
    }
}

ReactDOM.render(<Democlass1/>, document.getElementById('root'))
```

```js
class Democlass1 extends React.Component {

    state = {
        name: '组件'
    }

    // 箭头函数本身没有 this ，this 指向上一个this
    handleClick = () =>  {
        this.setState({
            name: '更改了名字'
        })
    }

        
    render() {
        return (<div>Democlass {this.state.name} --- 
            <button onClick={this.handleClick}>更改名字</button>
        </div>)
    }
}

ReactDOM.render(<Democlass1/>, document.getElementById('root'))
```