
# func

## 高阶函数

- 若A函数，接收的参数为一个函数，那么A函数就可以称为高阶函数

- 若A函数，调用的返回值是一个函数，那么A函数可以称为高阶函数

- Promise 递归 setTimeout setInterval Array.map ...

## 函数的柯里化

- 通过函数的调用，继续返回函数的方式，实现多次接收参数，最后实现统一处理的函数编码方式

```js

function sum(a) {
    return (b) => {
        return (c) => {
            return a + b + c
        }
    }
}

const r = sum(1)(2)(3)

```

```js

class Login extends React.Component {

    state = {
        username: '',
        password: '',
        pwd: ''
    }

    // 更新状态 统一处理
    saveFormData = (type) => {
        return (event) => {
            this.setState({
                [type]: event.target.value
            })
        }
    }

    saveData = (type, value) => {
        this.setState({
            [type]: value
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
                {/*  */}
                用户名： <input onChange={this.saveFormData('username')} name="username" />
                密码： <input onChange={this.saveFormData('password')} name="password" />
                {/*  */}
                确认密码： <input onChange={(event) => {this.saveData('pwd', event.target.value)}} name="pwd" />
                <button>登录</button>
            </form>
        )
    }
}

ReactDOM.render(<Login />, document.getElementById('root'))

```