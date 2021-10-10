# react 脚手架 create-react-app

- manifest.json 加壳 

- React.StrictMode 检查代码规范

- reportWebVitals 页面性能分析文件（记录页面性能），依赖 web-vitals

- setupTests 组件单元测试文件，依赖 jest-dom

- 样式模块化 避免样式冲突
```js
import demo from './demo.module.css'
```

## todoList 案例总结

- 父组件给子组件传值 props

- 子组件给父组件传值 props 把父组件的函数传给子组件

## 代理

- package.json 

```js
"proxy": "localhost:5000"
```

```js
proxy('/api1', { // 拦截 api1 前缀的请求
    target: "需要代理了到的服务器地址",
    changeOrigin: true,// 控制服务器收到的响应头中 host 字段的值
    pathRewrite: {
        '^/api': ''
    }
}),
```

## 消息订阅与发布

## fetch

## 前端路由

- createBrowserHistory 路由使用 H5 的history api

- createHashHistory hash值

### react-router

#### web --> react-router-dom

- BrowserRouter 一个应用应该只有一个路由器

- Link Route

```js

<BrowserRouter>
    <App />
</BrowserRouter>

<HashRouter>
    <App />
</HashRouter>

// 路由跳转
<Link to="/todo">todo</Link>

// 注册路由
<Route path="/todo" component={ Todo } />

```

- 给当前激活路由标签添加 active 类名
```js

<NavLink to="/todo" className="btn">todo</NavLink>

```

- 使用 switch 匹配到就不向后匹配，效率高

```js
<NavLink to="/todo" className="btn">todo</NavLink>
```

- 路由的模糊匹配(默认)，第一次匹配不到，则终止匹配

- 路由的严格匹配，在 Navlinv 标签中使用 exact=true

- 路由重定向，当所有路由匹配不到，则走重定向的路由

```js
<Redirect to="/search" />
```

- 路由嵌套

    1. 注册子路由时，需要协商父路由
    2. 路由的匹配按照注册路由的顺序进行

- 路由传参

    - 向路由组件传递 params 参数

        ```js
        // 传参
        <Link path={`/home/message/01/跳转路由`} component={Detail} />

        // 注册路由
        <Route path={`/home/message/detail/:id/:title`} component={Detail}  />

        // detail 组件中接收
        const { id, title } = this.props.match.params
        ```

    - 向路由组件传递 search 参数(/?id=id&title=title, 类似于 query参数)

        ```js
        // 跳转路由时传参
        <Link to={`/home/message/detail?id=id&title=title`} component={Detail} />

        // 注册路由
        <Route path={`/home/message/detail`} component={Detail}  />

        // detail 组件中接收 需要转码解析
        const search = this.props.location.search
        ```

    - 向路由组件传递 state 参数

        ```js
        // 跳转路由时传参
        <Link to={{ pathname: '/home/message//detail', state: {id: id, title: title}}} component={Detail} />

        // 注册路由
        <Route path={`/home/message/detail`} component={Detail}  />

        // detail 组件中接收
        const stateData = this.props.location.state

        // 备注：刷新也可以保留参数
        ```

#### native

#### any


#### QA

- 解决刷新页面，样式丢失问题
    1. index.html 中引入 css 文件，使用绝对路径
    2. index.html 中，使用 %PUBLIC_URL% 
    3. 使用 hashRouter, index.html中可使用相对路径

- 
