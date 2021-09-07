[eslint传送门](https://markdown.com.cn)。
# eslintrc.js配置


# QA

## no-param-reassign

- 禁止重新分配函数参数。不要直接修改函数的入参。因为假如入参是一个对象，修改入参可能会导致对象的属性被覆盖

```js
"no-param-reassign": [ // 为这个规则添加一个白名单，即指定的入参名称不予限制
    "error",
    {
        "props": true,
        "ignorePropertyModificationsFor": [
            "e", // for e.returnvalue
            "ctx", // for Koa routing
            "req", // for Express requests
            "request", // for Express requests
            "res", // for Express responses
            "response", // for Express responses
            "state" // for vuex state
        ]
    }
]
```

## Do not use 'new' for side effects (no-new)

- new与构造函数一起使用的目标通常是创建特定类型的对象并将该对象存储在变量中

- 使用new而不存储结果的情况不太常见

- 在这种情况下，创建的对象被丢弃，因为它的引用没有存储在任何地方，并且在许多情况下，这意味着应该用不需要使用的函数替换构造函数new。

```js
var thing = new Thing();

Thing();

```

## Unary operator '++' used no-plusplus

- 禁止使用一元运算符++and --

```js
.eslintrc.js 配置

"no-plusplus": [
    "off",
    {
        "allowForLoopAfterthoughts": true // allows unary operators ++ and -- in the afterthought (final expression) of a for loop
    }
],
```

```js
使用+=或-=代替++ --，例如foo++;应该写成foo+=1;
```

```js
/*eslint no-plusplus: "disabeld"*/
```