
# EventEmitter类

- 所有的 I/O 操作在完成时会发送一个事件到事件队列

- Node.js 中很多对象都会分发事件，1. net.server 在每次有新链接时触发一个事件 2. fs.readStream 在文件被打开的时候触发一个事件

- EventEmitter 核心是事件触发和事件监听器功能的封装

- 添加一个新的监听器时，newListener 被触发，当移除一个监听器时，removeListener 被触发

```js

var { EventEmitter } = require('events')

var eventEmitter = new EventEmitter()

eventEmitter.on('some_event', function() {
    onsole.log('some_event 事件触发'); 
})

setTimeout(() => {
   eventEmitter.emit('some_event') 
}, 2000)

```


```
执行这段代码，控制台在1s之后打印“some_event 事件触发”

原理：eventEmitter注册了一个事件监听器，通过setTimeout在1s之后向eventEmitter对象发送了some_event事件，此时会调用some_event监听器
```

```
EventEmitter 由一个事件名（字符串）和若干个事件参数组成，每个事件，支持若干个事件监听器

当事件触发时，注册到事件的监听器依次被调用，事件参数作为回调函数的参数传递
```

## 参数和this 传给监听器

- 当调用 <b>普通的监听器函数</b> 时，this 指向引用监听器绑定到的 EventEmitter 实例

- ES6 箭头函数，this 不再是引用 EventEmitter 的实例

```js

var { EventEmitter } = require('events')

var eventEmitter = new EventEmitter()

eventEmitter.on('some_event', function() {
    onsole.log('some_event 事件触发', this ); 
    // this 为 EventEmitter {
        // _events:
        // [Object: null prototype] {
        //     undefined: [Function],
        //     connection: [Function: connectHandler],
        //     data_received: [Function] },
        // _eventsCount: 3,
        // _maxListeners: undefined }}
})

setTimeout(() => {
   eventEmitter.emit('some_event') 
}, 2000)

```

```js

var { EventEmitter } = require('events')

var eventEmitter = new EventEmitter()

eventEmitter.on('some_event', (a, b) => {
    console.log(a, b, this)

    // a1 b1 {}
})

eventEmitter.emit('some_event', 'a1', 'b1')

```


```js
var event = new EventEmitter()

event.on('some_event', function(arg1, arg2) {
    console.log('listener1----', arg1, arg2)
})

event.on('some_event', function(arg1, arg2, arg3) {
    console.log('listener2----', arg1, arg2, arg3)
})

event.emit('some_event', '参数1', '参数2', { name: '参数3'})
```

## 异步 VS 同步

- EventEmitter 按照注册顺序一次调用监听器。可以通过 <b>setImmediate</b> 和 <b>process.nextTick</b> 进行异步操作

- process.nextTick 在本阶段立即执行

- setImmediate 安排回调在 轮询 阶段完成后执行

```js

var event = new EventEmiiter()

eventEmitter.on('some_event', function(a, b) {
    setImmediate(() => {
        console.log('异步执行：', a, b)
    })
})
eventEmitter.emit('some_event', 1, 2)

eventEmitter.on('some_event1', function(a, b) {
    process.nextTick(() => {
        console.log('异步执行：', a, b)
    })
})
eventEmitter.emit('some_event1', 3, 4)

console.log('异步执行完毕')

//
// 异步执行完毕
// 3 4
// 1 2
```

## 方法
| 属性      | 描述 |
| ----------- | ----------- |
| addListener(event, listener)     | 为指定事件添加一个监听器到监听器数组的尾部       |
| on(event, listener)   | 指定事件注册一个监听器，接受一个字符串 event 和一个回调函数       |
| emit(event, [arg1], [arg2], [...]) | 按监听器的顺序执行执行每个监听器，如果事件有注册监听返回 true，否则返回 false |
| once(event, listener) | 为指定事件注册监听器，此监听器只触发一次，触发之后会立即移除 |
| removeListener(event, listener) | 移除指定事件的指定监听器，该监听器必须是在事件中被注册过。接受两个参数，第一个是事件名称，第二个是回调函数名称 |
| removeAllListeners([event]) | 移除所有事件的所有监听器， 如果指定事件，则移除指定事件的所有监听器 |
| setMaxListeners(n) | 默认情况下， EventEmitters 如果你添加的监听器超过 10 个就会输出警告信息。 setMaxListeners 函数用于改变监听器的默认限制的数量。 |
| listeners(event) | 返回指定事件的监听器数组。 |

## 类方法
| 方法      | 描述 |
| ----------- | ----------- |
| listenerCount(emitter, event)  | 返回指定事件的监听器数量     |

## 事件
| 方法      | 描述 |
| ----------- | ----------- |
| newListener(emitter, event)  | 该事件在添加新监听器时被触发    |
| removeListener(emitter, event)  | 从指定监听器数组中删除一个监听器。需要注意的是，此操作将会改变处于被删监听器之后的那些监听器的索引。    |

# error 事件

- 程序遇到异常时，触发 error 事件

- 当 error 事件被触发时，EventEmitter 如果没有处理响应的异常监听器，则会退出程序，抛出异常信息

- 一般会为触发 error 事件设置监听器，避免遇到错误时，整个程序崩溃

```js
eventEmitter.emit('error'); 
```

# 继承 EventEmitter

- fs net http 都是基于 EventEmitter 的子类 不会直接使用 EventEmitter
- 原因1: 具有某个实体功能对象实现事件符合语义，事件的监听和发生应该是一个对象的方法
- 原因2: javascript 对象是基于原型的，可支持继承，继承 EventEmitter 避免打乱原有的继承关系