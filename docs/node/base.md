# 事件循环

- 事件循环是 node.js 处理非阻塞 I/O 的处理机制。在特殊时候，会把 javascript 单线程的处理转移到内核中

## 事件循环解析机制

- 当启动 node.js，初始化事件循环，处理已提供的输入脚本（或丢入的REPL），可能会调取异步API、调度定时器、process.nextTick()，然后开始处理事件循环

```html

   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘

```

## 定时器

## 挂起的回调函数

## 轮询

- 重要功能
    + 计算应该阻塞和轮询的 I/O 时间
    + 处理轮询队列中的事件

- 当事件进入轮询阶段，并没有被调度的计时器时，执行以下：
    + 如果轮询队列不为空，事件循环将 循环访问 回调队列 并 同步执行他们，直到队列用尽 或 达到系统相关的硬件限制
    + 如果轮询队列为空，
        - 脚本被 setImmediate() 调度，则事件循环结束轮询，并继续检查阶段以执行那些被调度的脚本
        - 若未被 setImmediate() 调度，则事件循环将等待回调添加到队列中，立即执行脚本
    + 一旦轮询队列为空，事件循环将检查已达到时间阈值的计时器，如果一个或多个计时器已准备就绪，则事件循环将绕回计时器阶段，执行计时器回调

## 检查阶段

- 此阶段允许轮询阶段完成后，立即执行回调

- 如果轮询队列为空闲，检查到 setImmediate() 调用的事件被排列到队列中，则事件循环可能继续 检查 阶段，而不是等待

- setImmediate() 实际上是事件循环的单独阶段运行的特殊计时器。它使用一个 libuv api 安排回调在轮询阶段完成后执行

- 通常在执行代码时，事件循环最终会命中轮询阶段。在等待传入连接、请求等。但 如果回调被 setimmediate() 调度过，并且轮询阶段为 空闲 状态，则它将结束此阶段，并继续到检查阶段，而不是继续等待轮询事件。

## 关闭的回调函数

- 如果套接字 或 处理函数 突然关闭（例如： socket.destroy())，则 close 回调将在这个阶段发出。否则它将通过 process.nextTick() 发出。

## setImmediate() 对比 setTimeout()

- setImmediate() 和 setTimeout() 很类似，但基于被调用的时机，二者有不同表现
    + setImmediate() 在当前 轮询 结束时，立即执行脚本
    + setTimeout() 在最小阈值（ms 单位）之后，执行脚本

- 执行顺序根据调用他们的上下文决定。如果被不在 I/O 周期（即主模块）调用，受进程性能的约束（可能会受系统中其他进程的影响），执行顺序不确定。

```js

setImmediate(() => {
    console.log('Immediate')
})

setTimeout(() => {
    console.log('Timeout')
}, 0)


```

```
$ node immediate.js
timeout
immediate

$ node immediate.js
immediate
timeout
```

- 如果将两个函数放在 I/O 循环内调用，setImmediate 总被优先调用

```js

const fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    setImmediate(() => {
        console.log('immediate');
    });
});

```

```
$ node immediate.js
timeout
immediate

$ node immediate.js
timeout
immediate

```

- 使用 setImmediate() 较于 setTimeout() 的优势在于，如果setImmedate() 是在 I/O 周期内被调用的，那么它将会在任何计时器之前执行，跟存在多少个定时器无关

## process.nextTick()

- 从技术上讲，process.nextTick() 不是事件循环的一部分。相反，在当前操作完成之后执行 nextTickQueue，不管事件循环的当前阶段如何。这里的一个操作被视为一个从底层 C/C++ 处理器开始过渡，并且处理需要执行的 javascript 代码

- 任何时候在给定的阶段调用 process.nextTick()，回调将在事件循环继续之前解析。可能会发生糟糕的事情，因为允许 <b>递归调用 process.nextTick() 来饿死 I/O，阻止事件循环到达轮询阶段</b>

- 原因是：它的一部分设计理念，其中 API 应该始终是异步的，即使不必是。以下代码分析：命名了一个函数 someAsyncApiCall，提供给 someAsyncApiCall 一个回调函数，该回调函数是在事件循环的同一阶段内被调用，因为 someAsyncApiCall() 并没有异步执行任何事情。结果回调函数尝试引用 bar，但此时只定义并没有赋值给值，所以输出 undefined，因为脚本尚未运行完成。

- 要想正确输出 bar 的值，通过将回调置于 process.nextTick() 中，脚本仍有运行的能力，允许在调用回调之前初始化所有的变量和函数等。

- 还有让事件循环不在继续的优点，适用于让事件循环继续之前，警告用户发生错误。

```js

let bar;

// this has an asynchronous signature, but calls callback synchronously
function someAsyncApiCall(callback) { callback(); }

// the callback is called before `someAsyncApiCall` completes.
someAsyncApiCall(() => {
  // since someAsyncApiCall has completed, bar hasn't been assigned any value
  console.log('bar', bar); // undefined
});

bar = 1;

```

#3 process.nextTick() 对比 setImmediate()

- process.nextTick 在同一阶段立即执行

- setImmediate() 在事件循环的接下来的迭代或 'tick' 上触发

- 建议开发人员在所有情况下都使用 setImmediate()，因为它更容易理解

## 为什么要使用 process.nextTick()

- 允许用户处理错误，清理任何不需要的资源，或在事件循环继续之前重试请求

- 有时有让回调在栈展开之后，但在事件循环继续之前调用的需要

```js

const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
//   this.emit('event');


  // use nextTick to emit the event once a handler is assigned
  process.nextTick(() => {
    this.emit('event');
  });

}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});

```

```
运行的函数构造函数 MyEmitter 是从 EventEmitter 继承的，想调用构造函数，不能在构造函数中立即触发事件，因为脚本还未处理到为该事件分配回调函数的地方。因此在构造函数本身中，使用 process.nextTick() 来设置回调，以便在构造函数完成后，发出该事件。
```