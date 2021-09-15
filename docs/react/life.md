# 生命周期

## 旧（生命周期回调函数、生命周期钩子函数）

- render 调用的时机是，组件初始化和更新状态

- 初始化：由 ReactDOM.render() 触发
    - constructor -> componentWillMount -> render -> componentDidMount

- 更新阶段：由组件内部 setState 或 父组件 render 触发
    - shouldComponentUpdate -> componentWillUpdate -> render -> componentDidUpdate

- 卸载组件：由 ReactDOM.uunmountComponentAtNode 触发
    - componnetWillUnmount

- componentWillReceiveProps

## 新

- 初始化：constructor -> getDerivedStateFromProps -> render -> componentDidMount

- 更新阶段：shouldComponentUpdate -> render -> getSnapshotBeforeUpdate ->  React 更新 DOM 和 refs ->componentDidUpdate

- 卸载组件： componnetWillUnmount

- UNSAFE_componentWillMount、 UNSAFE_componentWillUpdate、 UNSAFE_componentWillReceiveProps
