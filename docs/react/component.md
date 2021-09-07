# 函数式组件

- 适用于【简单组件】的定义 无状态组件

- 大写命名

- this 指向 undefined 。因为经过 babel 编译，开启严格模式 'use strict'，禁止this 指向 window

- 原理
    执行 ReactDOM.render(<Demo/>, root) 之后
    1. react 解析组件标签，找到 Demo 组件
    2. 发现组件是使用函数定义的，随后调用函数，将返回的虚拟 DOM 返回，渲染到页面上
```js

function Demo() {
    return <div>demo 函数式组件</div>
}

ReactDOM.render(<Demo/>, root)

```

# 类式组件

## class 的基本知识

- 如果 A类 继承了 B类，A类 写了 构造器 constructor，一定要写 super

- 类中的方法 挂载在原型对象上，实例可以访问

```js
class Person {
    // 构造器函数
    constructor(name, age) {
        // this 指向类的实例对象
        this.name = name;
        this.age = age;
    }
    // 一般方法 在 类的原型对象上，类的实例使用
    // 通过 Person 实例调用 speak 方法时，this 指向 Person 实例
    speak() {
        console.log(`我的名字是：${this.name}`)
    }
}

// 创建 Person 对象的实例对象
const p1 = new Person('笑死人', 16)
const p2 = new Person('笑死人', 16)
p1.speak() // 我的名字是：笑死人
p2.speak.call({ name: '小四' }) // 我的名字是: undefined

class Student extends Person {
    constructor() {
        super()
    }

}
```

## class 组件

- 适用于【复杂组件】定义 有状态组件

- 执行 ReactDOM.render(<Democlass/>, document.getElementById('root')) 之后

    1. react 解析标签，找到 Democlass 组件，随后 new 了该类的实例，调用原型上的 render 方法，将虚拟 DOM 转为真实dom，渲染到页面
    2. render 存在 类 的原型对象上，供实例使用
    3. render 中的 this 指向 Democlass 的组件实例对象

```js

// 定义 class 组件
class Democlass extends React.Component {
    // render 存在 类 的原型对象上，供实例使用
    render() {
        return (<div>Democlass 组件</div>)
    }
}

ReactDOM.render(<Democlass/>, document.getElementById('root'))

```

