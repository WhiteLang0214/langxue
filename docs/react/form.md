# form

## 非受控组件

- 输入类的组件，对组件的值现用现取

```js

class Login extends React.Component {

    handleSubmit = (event) => {
        event.preventDefault() // 阻止表单默认事件，阻止表单刷新
        const { input1, input2 } = this;
        alert(`用户名是：${input.value} 密码：${input2.value}`)
    }

    render() {
        return (
            <form action="" onSubmit={this.handleSubmit}>
                用户名： <input ref={c => this.input1 = c} name="username" />
                密码： <input ref={c => this.input2 = c} name="password" />
                <button>登录</button>
            </form>
        )
    }
}

ReactDOM.render(<Login />, document.getElementById('root'))

```

## 受控组件

```js

class Login extends React.Component {

    state = {
        username: '',
        password: ''
    }

    // 更新状态中的 username
    saveUsername = (event) => {
        this.setState({
            username: event.target.value
        })
    }

    // 更新状态中的 password
    savePassword = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    handleSubmit = (event) => {
        event.preventDefault() // 阻止表单默认事件，阻止表单刷新
        const { username, password } = this.state;
        alert(`用户名是：${username} 密码：${password}`)
    }

    render() {
        return (
            <form action="" onSubmit={this.handleSubmit}>
                用户名： <input onChange={this.saveUsername} name="username" />
                密码： <input onChange={this.savePassword} name="password" />
                <button>登录</button>
            </form>
        )
    }
}

ReactDOM.render(<Login />, document.getElementById('root'))

```