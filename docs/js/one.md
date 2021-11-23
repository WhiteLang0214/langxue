# 手撕JS源码(new,curry,Promise,双向绑定)

1. 手撕new

```js
 function new (Func, ...arg) {
    let obj = {} // 定义了一个对象
    obj.__proto__ = Func.prototype // 将 Func.prototype 赋值为对象的 __proto__ 属性，即原型链的概念
    let res = Func.call(obj, ...arg) // 更改 Func 的 this 指向
    return res instanceof Object ? res : obj
 }
```

2. 函数柯里化

柯里化(currying)指的是将一个多参数的函数拆分成一系统函数，每个拆分后的函数都只接受一个参数(unary)

```js
function add(a, b) {
    return a + b
}

add(1, 1) // 2
```

上面代码中，函数 **add** 接受两个参数 a 和 b

柯里化就是将上面的函数拆分成两个函数，每个函数都只接受一个参数

```js
function add(a) {
    return function(b) {
        return a + b
    }
}

// 或者采用箭头函数写法

const add = x => y => x + y
const f = add(1)
f(1)

```

上面代码中，函数 **add** 只接受一个参数 a，返回一个函数 f。函数 f 也只接受一个参数 b。

```js
const curry = (fn, arr = []) => (...args) => (a => a.length === fn.length ? fn(...a) : curry(fn, a))([...arr, ...args])

let curryPlus = curry((a, b, c, d) => a+b+c+d)

curryPlus(1,2,3)(4) // 10
curryPlus(1,2)(4)(3) // 10
curryPlus(1,2)(3,4) // 10
```

3. 手撕 Promise

- promise 的逻辑
    - Promise 是一个类 exectuor 是一个立即执行函数
    - 有三个状态 默认是[PENDING] FULFILED(成功态)、REJECTED(失败态)，状态一经改变不能再修改
    - resolve 和 reject 的结果传入到 then 中的回调函数中
    - 发布订阅模式实现异步执行
    - 如果 promise 返回一个普通值（不论是 resolve 还是 reject 中返回的）都传递到下一个 then 的成功中
    - 如果返回一个错误，一定走到下一次的失败
    - 如果返回的是一个 promise 回采用 promise 的状态决定下一次的成功还是失败，如果离自己最近的 then 没有错误处理，会向下查找
    - 每次执行 promise.then 都会返回一个“全新的 promise”

- Promise 基本结构

```js
class Promise {
    constructor(executor) {
        // 定义 resolve
        let resolve = res => {}

        // 定义 reject
        let reject = err => {}

        // 自动执行
        executor(resolve, reject)
    }
}
```

- Promise 三种状态实现

    - pendiing[待定] 初始状态
    - fulfilled[实现] 操作成功
    - rejected[被否决] 操作失败

    1. promise 对象初始化状态为 pending
    2. 当调用 resolve (成功)，会由 pending => fulfilled
    3. 当调用 reject(失败)，会由 pending => rejected

```js
class Promise {
    constructor(executor) {
        this.status = "pending"; // 默认状态
        this.value; // resolve 成功时的值
        this.error; // reject 失败时的值

        let resolve = res => {
            if (this.status === 'pending') {
                this.value = res;
                this.status = "resolved"
            }
        }

        let reject = err => {
            if (this.status === 'pending') {
                this.error = err;
                this.status = "rejected";
            }
        }

        executor(resolve, reject)
    }
}
```

- Promise 对象方法 then 实现

then 接受两个回调：onFulfilled(成功的回调)，onRejected(失败的回调)

```js
promise.then(onFulfilled, onRejected);

1. onFulfilled(onResolved): 可选参数，如果不是函数则必须忽略
2. onRejected: 可选参数，如果不是函数则必须忽略
3. 当 promise 成功执行，所有 onFulfilled 按注册顺序执行，如果 promise 被拒绝，所有 onRejected 按注册顺序执行。
4. onFulfilled 和 onRejected 必须作为纯函数调用
5. promise 的 executor 执行完毕并调用 resolve 或 reject 方可调用 then 参数 onFulfilled 和 onRejected
6. 无论 promise 状态是 resolved 还是 rejected，只要还有未执行 onFulfilled, onRejected 或 catch(只处理reject状态)存在且调用，返回的promise均为resolved状态

class Promise {
    constructor(executor) {
        this.status = "pending"; // 默认 promise 状态
        this.value; // resolve 成功时的值
        this.error; // reject 失败时的值

        let resolve = res => {
            if (this.status === "pending") {
                this.value = res;
                this.status = "resolved";
            }
        }

        let reject = err => {
            if (this.status === "pending") {
                this.error = err;
                this.status = "rejected"
            }
        }

        exector(resolve, reject)
    }

    // 声明 then
    then(onFulfilled, onRejected) {
        if (this.status === "resolved") {
            onFulfilled(this.value)
        }
        if (this.status === "rejected") {
            onRejected(this.error)
        }
    }
}
```

我们增加了 onFulfilled 和 onRejected，用来储存我们在then中回调。then 中可传递一个成功和一个失败的回调，当 pending 的状态变为 resolve 时之行成功回调，当 pending 的状态变为 reject 或者出错时执行失败的回调。

- Promise 异步实现

当 resolve 在 setTimeout 内执行，then 函数执行时 state 还是 pending 等待状态。我们就是需要在 then 调用的时候，将成功和失败存到各自的数组，一旦 reject 或者 resolve，就调用他们。

类似于分布订阅，先将 then 内的两个函数存储，由于 promise 可以有多个 then，所以存在同一个数组内。当成功或失败的时候用 forEach 调用他们。

```js
class Promise {
        constructor(executor) {
            this.status = "pending"; // 默认promise状态
            this.value;  // resolve成功时的值
            this.error;  // reject失败时的值
            this.resolveQueue = []; // 成功存放的数组
            this.rejectQueue = []; // 失败存放法数组

            let resolve = value => {
                if(this.status === "pending") {
                    this.value = value;
                    this.status = "resolved";
                    // 一旦resolve执行，调用成功数组的函数
                   this.resolveQueue.forEach(fn => fn());
                }
            }

            let reject = value => {
                if(this.status === "pending") {
                    this.error = value;
                    this.status = "rejected";
                }
                // 一旦reject执行，调用失败数组的函数
                this.rejectQueue.forEach(fn => fn());
            }

            executor(resolve, reject)
        }
        
        // 执行到then的时候
        then(onFullfilled, onRejected) {
            if(this.status === "resolved") {
                this.resolveQueue.push(() => {
                    onFullfilled(this.value);
                })
            }
            if(this.status === "rejected") {
                this.rejectQueue.push(() => {
                    onRejected(this.error);
                })
            }
            // 当状态state为pending时
            if(this.status === "pending") {
                // onFulfilled传入到成功数组
                this.resolveQueue.push(() => {
                    onFullfilled(this.value);
               })
                // onRejected传入到失败数组
                this.rejectQueue.push(() => {
                    onRejected(this.error);
                })
            }
        }
    }

```

- then 的链式调用

链式调用，也就是我们经常看到的new Promise().then().then()这样的写法，可以解决地狱回调。

```js
class Promise {
    constructor(executor) {
        this.status = "pending"; // 默认promise状态
        this.value;  // resolve成功时的值
        this.error;  // reject失败时的值
        this.resolveQueue = []; // 成功时回调队列
        this.rejectQueue = []; // 失败时回调队列

        let resolve = value => {
            if(this.status === "pending") {
                this.value = value;
                this.status = "resolved";
                this.resolveQueue.forEach(fn => fn())
            }
        }

        let reject = value => {
            if(this.status === "pending") {
                this.error = value;
                this.status = "rejected";
                this.rejectQueue.forEach(fn => fn())
            }
        }

        executor(resolve, reject)
    }

    then(onFullfilled, onRejected) {
        let promise2;
        promise2 = new Promise((resolve, reject) => {
            if(this.status === "resolved") {
                let x = onFullfilled(this.value);
                // resolvePromise函数，处理自己return的promise和默认的promise2的关系
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "rejected") {
                let x = onRejected(this.value);
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "pending") {
                this.resolveQueue.push(() => {
                    let x = onFullfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject);
                })
                this.rejectQueue.push(() => {
                    let x = onRejected(this.error);
                    resolvePromise(promise2, x, resolve, reject);
                })
            }
        });
        
        // 返回 promise，达成链式效果
        return promise2;
    }
}

/**
 * 处理promise递归的函数
 *
 * promise2 {Promise} 默认返回的promise
 * x {*} 我们自己 return 的对象
 * resolve
 * reject
 */
 function resolvePromise(promise2, x, resolve, reject){
  
  // 循环引用报错
  if(x === promise2){
    // reject 报错抛出
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  
  // 锁，防止多次调用
  let called;
  
  // x 不是 null 且 x 是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then;
      
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') { 
        // then 执行 第一个参数是 this 后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) { // 走到 catch 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}

```

- 值穿透调用

当执行多个 then,我们期望最后那个 then 打印出 “Feng”

```js
new Promise((resolve, reject)=>{
    resolve('Feng');
}).then().then().then().then().then().then().then((res)=>{ 
    console.log(res);
})
```

实现很简单：onFulfilled 如果不是函数，就忽略 onFulfilled,直接返回 value

相应的，我们也要处理下没有 onRejectd 的情况：onRejected 如果不是函数，就忽略 onRejected，直接扔出错误

```js
class Promise {
    constructor(executor) {
        this.status = "pending"; // 默认promise状态
        this.value;  // resolve成功时的值
        this.error;  // reject失败时的值
        this.resolveQueue = []; // 成功时回调队列
        this.rejectQueue = []; // 失败时回调队列

        let resolve = value => {
            if(this.status === "pending") {
                this.value = value;
                this.status = "resolved";
                this.resolveQueue.forEach(fn => fn())
            }
        }

        let reject = value => {
            if(this.status === "pending") {
                this.error = value;
                this.status = "rejected";
                this.rejectQueue.forEach(fn => fn())
            }
        }

        executor(resolve, reject)
    }

    then(onFullfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err;}
        let promise2;
        promise2 = new Promise((resolve, reject) => {
            if(this.status === "resolved") {
                let x = onFullfilled(this.value);
                // resolvePromise函数，处理自己return的promise和默认的promise2的关系
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "rejected") {
                let x = onRejected(this.value);
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "pending") {
                this.resolveQueue.push(() => {
                    let x = onFullfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject);
                })
                this.rejectQueue.push(() => {
                    let x = onRejected(this.error);
                    resolvePromise(promise2, x, resolve, reject);
                })
            }
        });
        
        // 返回 promise，达成链式效果
        return promise2;
    }
}

/**
 * 处理promise递归的函数
 *
 * promise2 {Promise} 默认返回的promise
 * x {*} 我们自己 return 的对象
 * resolve
 * reject
 */
 function resolvePromise(promise2, x, resolve, reject){
  
  // 循环引用报错
  if(x === promise2){
    // reject 报错抛出
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  
  // 锁，防止多次调用
  let called;
  
  // x 不是 null 且 x 是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then;
      
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') { 
        // then 执行 第一个参数是 this 后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) { // 走到 catch 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}

```

- Promise 对象方法 catch

catch 是失败的回调，相当于执行 this.then(null,fn)。

```js
class Promise {
    constructor(executor) {
        this.status = "pending"; // 默认promise状态
        this.value;  // resolve成功时的值
        this.error;  // reject失败时的值
        this.resolveQueue = []; // 成功时回调队列
        this.rejectQueue = []; // 失败时回调队列

        let resolve = value => {
            if(this.status === "pending") {
                this.value = value;
                this.status = "resolved";
                this.resolveQueue.forEach(fn => fn())
            }
        }

        let reject = value => {
            if(this.status === "pending") {
                this.error = value;
                this.status = "rejected";
                this.rejectQueue.forEach(fn => fn())
            }
        }

        executor(resolve, reject)
    }

    then(onFullfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err;}
        let promise2;
        promise2 = new Promise((resolve, reject) => {
            if(this.status === "resolved") {
                let x = onFullfilled(this.value);
                // resolvePromise函数，处理自己return的promise和默认的promise2的关系
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "rejected") {
                let x = onRejected(this.value);
                resolvePromise(promise2, x, resolve, reject);
            }
            if(this.status === "pending") {
                this.resolveQueue.push(() => {
                    let x = onFullfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject);
                })
                this.rejectQueue.push(() => {
                    let x = onRejected(this.error);
                    resolvePromise(promise2, x, resolve, reject);
                })
            }
        });
        
        // 返回 promise，达成链式效果
        return promise2;
    }

        catch(onRejected) {
            return this.then(null, onRejected)
        }
}

/**
 * 处理promise递归的函数
 *
 * promise2 {Promise} 默认返回的promise
 * x {*} 我们自己 return 的对象
 * resolve
 * reject
 */
 function resolvePromise(promise2, x, resolve, reject){
  
  // 循环引用报错
  if(x === promise2){
    // reject 报错抛出
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  
  // 锁，防止多次调用
  let called;
  
  // x 不是 null 且 x 是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+ 规定，声明then = x的then方法
      let then = x.then;
      
      // 如果then是函数，就默认是promise了
      if (typeof then === 'function') { 
        // then 执行 第一个参数是 this 后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // 核心点2：resolve 的结果依旧是 promise 那就继续递归执行
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) { // 走到 catch 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}

```