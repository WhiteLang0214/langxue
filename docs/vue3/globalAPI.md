# 全局API

- 全局api是直接在 Vue 上挂载方法，在 Vue 中，全局API一共有13个，分别如下：

    1. createapp 返回一个提供应用上下文的应用实例
    2. h 返回一个 “虚拟节点”
    3. definecomponent 返回 options 的对象，在 TS 下，会给予组件正确的参数类型推断；
    4. defineasynccomponent 创建一个只有在需要时才会加载的异步组件；
    5. resolvecomponent 按传入的组件名称解析 component；
    6. resolvedynamiccomponent 返回已解析的 Component 或 新建的 VNode;
    7. resolvedirective 通过其名称解析一个 directive
    8. withdirectives 返回一个包含应用指令的 VNode;
    9. createrenderer 跨平台自定义渲染；
    10. nexttick 是将回调函数延迟在下一次 dom 更新数据后调用；
    11. mergeprops 将包含 VNode prop 的多个对象合并为一个单独的对象；
    12. usecssmodule 访问 css 模块；
    13. version 查看已安装的 Vue 的版本号;

<b>01、createApp</b>

- 官方定义：返回一个提供应用上下文的应用实例。应用实例挂载的整个组件树共享同一个上下文。
- 理解：createApp 作为 vue 的启用函数，返回一个应用实例，每个 Vue 应用程序都首先使用以下函数创建一个新的应用实例，应用程序实例公开的大多数方法都返回相同的实例，可以链式调用。例如：

``` Vue.createapp({}).component('SearchInput', SearchInputComponent) ```

- 用法
    - 第一个参数：接收一个根组件选项
    - 第二个参数：将根 prop 传递给应用程序

    ```js
    // 用法示例
    import { createApp, h, nextTick } form 'vue'
    const app = createApp({
        data() {
            return {}
        },
        methods: {},
        computed: {}
    }, { username: 'langxue' })
    ```

    <b>源码浅析</b>
    
    GitHub 地址：
    - createapp() 56行-102行内容 [1]
    - ensureRender() 35行 - 37行内容 [2]
    - createRenderer() 419行 - 424行内容 [3]
    - baseCreateRenderer() 448行 - 2418行内容[4]
    - app._component 174行内容[5]
    
    ```js
    export const createApp = ((...args) => {
        // 使用 ensureRender().createApp() 来创建 app 对象
        // 源码位置上方[2]
        // -> ensureRenderer 方法调用了来自 runtime-core 的 createRenderer
        // 源码位置上方[3]
        // -> createRenderer(HostNode, HoseElement),两个通用参数 HostNode (主机环境中的节点)和 HostElement (宿主环境中的元素)，对应于宿主环境。
        // -> reateRenderer(使用(可选的)选项创建一个 Renderer 实例。)，该方法返回了 baseCreateRender
        // 源码位置上方[4]
        // -> baseCreateRenderer 方法最终返回 render hydrate createApp 三个函数，生成的 render 传给 createAppAPI，hydrate 为可选参数，ssr 的场景下会用到。

        const app = ensureRender().createApp(...args)
        
        if (__DEV__) {
            // DEV 环境下，用于组件名称验证是否是原生标签或者svg属性标签
            injectNativeTagCheck(app)
            // DEV 环境下，检查CompilerOptions如果有已弃用的属性，显示警告
            injectCompilerOptionsCheck(app)
        }

        const { mount } = app
        // 从创建的 app 对象中结构获取 mount，改写 mount 方法后，返回 app 实例
        app.mount = (containerOrSelector: Element | ShandowRoot | string):any => {
            // container 是真实的 DOM 元素，normalizeContainer 方法使用 document.querySelector 处理传入的 <containerOrSelector> 参数，如果在 DEV 环境下元素不存在或者元素为影子 DOM 并且 mode 状态为 closed，则返回相应的警告
            const container = normalizeContainer(containerOrSelector)
            // 如果不是真实的 DOM 元素则 return
            if (!container) return

            // 这里的app._component 其实就是全局 API 的 createApp 的第一个参数，源码位置在上方[5]
            const component = app._component
            // component 不是函数 并且 没有不包含 render、template
            if (!isFunction(component) && !component.render && !component.template) {
                // 不安全的情况
                // 原因：可能在 dom 模版中执行 js 表达式。
                // 用户必须确保内 dom 模版是可信的。如果它是模版，不应该包含任何用户数据

                // 使用 DOM 的 innerhtml 作为 component.template 内容
                component.template = container.innerhtml
                // 2. 挂载前检查，获取元素属性的集合遍历如果 name 不是 v-cloak 状态 并且属性名称包含 v-、:、@、,会给出 vue 文档链接提示
                if (__COMPAT__ && __DEV__) {
                    for (let i=0; i<container.attributes.length; i++) {
                        const attr = container.attributes[i]
                        if (attr.name !== 'v-cloak' && /^(v-|:|@)/.test(attr.name)) {
                            compatUtils.warnDeprecation(DeprecationTypes.GLOBAL_MOUNT_CONTAINER, null)
                            break
                        }
                    }
                }
            }

            // 挂载前清除内容
            container.innerHTML = ''
            // 真正的挂载（元素，是否为 SVG 元素）
            const proxy = mount(container, false, container instanceof SVGElement)
            if (container instanceof Element) {
                // 删除元素上的 v-cloak 指令
                container.removeAttribute('v-cloak')
                // 设置 data-v-app 属性
                container.setAttribute('>'')
            }
            return proxy
        }
        return app
    }) as CreateAppFuncion<Element>
    ```
    
<b>02、h</b>
- 官方定义：返回一个“虚拟节点”，通常缩写为 VNode: 一个普通对象，其中包含向 Vue 描述它应在页面上渲染哪种节点的信息，包括所有子节点的恶描述。它的目的是用于手动编写的渲染函数；

> h的含义如下：
> It comes from the term "hyperscript", which is commonly used in many virtual-dom implementations. "Hyperscript" itself stands for "script that generates HTML structures" because HTML is the acronym for "hyper-text markup language".
> 它来自术语"hyperscript"，该术语常用于许多虚拟 dom 实现。"Hyperscript" 本身代表 "生成 HTML 结构的脚本"，因为 HTML 是"超文本标记语言"的首字母缩写词。
> 回复出处：github.com/vuewjs/babel......

- 其实 h() 函数和 createVNode() 函数都是创建 dom 节点，他们的作用是一样的，但是在 VUE3 中，createVNode() 函数的功能比 h() 函数要多且做了性能优化，渲染节点的速度要更快。

- 用法
    - 第一个参数：HTML 标签名、组件、异步组件或函数式组件。使用返回 null 的函数将渲染一个注释。此参数是必需的。
    - 第二个参数：一个对象，与我们将在模板中使用的 attribute、prop、class 和、style 和事件相对应。可选
    - 第三个参数：子代 VNode，使用 h() 生成，或者使用字符串来获取“文本 VNode”,或带有插槽的对象。可选。

    ```js
    h('div',{}, [
        'some text comes first.',
        h('h1', 'A headline'),
        h(MyComponent, {
            someProp: 'foobar'
        })
    ])
    ```

    <b>源码浅析</b>
    
    GitHub 地址：
    - h 174行-196行内容 [6]

    ```js
    // 源码位置见上方[6]
    export function h(type: any, propsOrChildren?: any, children?: any): VNode {
        const l = arguments.length
        // 如果参数是两个
        if (l === 2) {
            // 判断是否是对象，并且不为数组
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                // 所有 VNode 对象都有一个 __v_isVNode 属性，isVNode 方法也是根据这个属性来判断是会否为 VNode对象。
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren])
                }
                // 只包含属性不含有子元素
                return createVNode(type, propsOrChildren)
            } else {
                // 忽略 props 属性
                return createVNode(type, null, propsOrChildren)
            }
        } else {
            if (l > 3) {
                // Array.protoytpe.slice.call(arguments, 2) 这句话的意思是把调用方法的参数截取出来，可以理解成是让 arguments 转换成一个数组对象，让 arguments 具有 slice() 方法
                children = Array.proptotype.slice.call(arguments, 2)
            } else if (l === 3 && isVNode(children)) {
                // 如果参数长度等于3，并且第三个参数为 VNode 对象
                children = [children]
            }
            // h 函数内部的主要处理逻辑就是根据参数个数和参数类型，执行相应处理操作，但最终都是通过调用 createVNode 函数来创建 VNode 对象
            return createVNode(type, propsOrChildren, children)
        }
    }
    ```
    
<b>03、defineComponent</b>

- 官方定义：defineComponent 只返回传递给它的对象。但是，就类型而言，返回的值有一个合成类型的构造函数，用户手动渲染函数、TSX 和 IDE 工具支持。

> defineComponent 主要是用来帮助 Vue 在 TS 下正确推断出 setup() 组件的参数类型
> 引入 defineComponent() 以正确推断 setup() 组件的参数类型；
> defineComponent 可以正确适配无 props、数组 props 等形式；

- 用法
    **参数：** 具有组件选项的对象或者是一个 setup 函数，函数名称将作为组件名称来使用

    ```js
    // 之前写 Ts+Vue ，需要生命相关的数据类型。如下
    // 声明 props 和 return 的数据类型
    interface Data {
        [key: string]: unknown
    }
    // 使用的时候入参要加上声明，return 也要加上声明
    export default {
        setup(props: Data): Data {
            return {}
        }
    }

    // 非常繁琐，使用 defineComponent 之后，就可以省略这些类型定义，defineComponent 可以接受显式的自定义 props 接口或从属性验证对象中自动推断；

    // 用法示例1
    import { defineComponent } from 'vue'

    const MyComponnet = defineComponnet({
        data() {
            return { count: 1 }
        },
        methods: {
            increment() {
                this.count++
            }
        }
    })

    // 用法示例2:
    // 不只适用于 setup，只要是 Vue 本身的 API，defineComponent 都可以自动帮你推导
    import { defineComponent } form 'vue'
    export default defineComponent({
        setup(props, context) {
            return {}
        }
    })
    ```

    <b>源码浅析</b>

    ```js
    // 实际上这个 api 只是直接 return 传进来的 options, export default defineComponent({}) 是有点等价于 export default{}, 目前看来这样做的最大作用只是限制 type，setup 必须是函数，props 必须是 undefined 或者 对象。
    export function defineComponent(options: unknown) {
        return isFunction(options) ? { setup: options, name: options.name }
    }
    ```

<b>04、defineAsyncComponent</b>

- 官方定义：创建一个只有在需要时才会加载的一步组件。

- 用法

    - 参数：接受一个返回 Promise 的工厂函数。Promise 的 resolve 回调应该在服务端返回组件定义后被调用。

    ```js
    // 在 Vue2.x 中，声明一个异步组件只需这样
    const asyncModal = () => import('./Modal.vue')
    // 或者
    const asyncModal = {
        component: () => import('./Modal.vue'),
        delay: 200,
        timeout: 3000,
        error: ErrorComponent,
        loading: LoadingComponent
    }


    // 在 vue3 中，由于函数是组件被定义为纯函数，因此异步组件的定义需要通过将其包裹在新的 defineAsyncComponent 助手方法中来显式地定义：
    import { defineAsyncComponent } from 'vue'
    import ErrorComponent from './components/ErrorComponent.vue'
    import LoadingComponent from './componnets/loadingComponent.vue'

    // 不带选项的一步组件
    const asyncModalWithOpgions = defineAsyncComponent({
        loader: () => import('./Modal.vue'),
        delay: 200,
        timeout: 3000,
        errorComponent: ErrorComponent,
        loadingComponnet: LoadingComponent
    })
    ```
    <b>源码浅析</b>
    GitHub地址：41行 - 196行

    ```js
    // 源码位置见上方
    export function defineAsyncComponent<T extends Component = {new (): ComponentPublicInstance }>(source: AsyncComponentLoader<T> | AsyncComponentOptions<T>):T {
        if (isFunction(source)) {
            source = { loader: source }
        }
        // 异步组件的参数
        const {
            loader,
            loadingComponent,
            errorComponent,
            delay = 200,
            timeout, // undefined = never times out
            suspensible = true,
            onError: userOnError
        } = source

        let pendingRequest: Promise<ConcreteComponent> | null = null
        let resolvedComp: ConcreteComponent | undefined

        let retries = 0
        // 重新尝试load的到组件内容
        const retry = () => {
            retries++
            pendingRequest = null
            return load()
        }

        const load = (): Promise<ConcreteComponent> => {
            let thisRequest: Promise<ConcreteComponent>
            return (
                // 如果 pendingRequest 存在就 return，否则实行 loader()
                pendingRequest || (thisRequest = pengdingRequest = loader()
                // 失败场景处理
                .catch(err => {
                    err = err instanceof Error ? err : new Error(String(err))
                    if (userOnError) {
                        // 对应文档中的失败捕获回调函数 用户使用
                        return new Promise((resolve, reject) => {
                            const userRetry = () => resolve(retry())
                            const userFail = () => reject(err)
                            userOnError(err, userRetry, userFail, retries + 1)
                        })
                    } else {
                        throw err
                    }
                })
                .then((comp: any) => {
                    if (thisRequest !== pendingRequest && pendingRequest) {
                        return pendingRequest
                    }
                    // 如果在 DEV 环境则警告
                    if (__DEV__ && !comp) {
                        warn(`Async component loader resolved to undefined.` + `If you are using retry(),make sure to return its return value.`
                        )
                    }
                    // interop module default
                    if (comp && (comp.__esModule || comp[Symbol.toStringTag] === 'Module')) {
                        comp = comp.default
                    }
                    // 如果在 DEV 环境则警告
                    if (__DEV__ && comp && !isObject(comp) && !isFunction(comp)) {
                        throw new Error(`Invalid async component load result: ${comp}`)
                    }
                    resolvedComp = comp
                    return comp
                }))
            )
        }
        return defineComponent({
            __asynvLoader: load,
            // 异步组件统一名字
            name: 'AsyncComponentWrapper',
            // 组件有 setup 方法的走 setup 逻辑
            setup() {
                const instance = currentInstance!

                // already resolved
                if (resolvedComp) {
                    return () => createInnerComp(resolvedComp!, instance)
                }
                
                const onError = (err: Error) => {
                    pendingRequest = null
                    handleError(
                        err,
                        instance,
                        ErrorCodes.ASYNC_COMPONENT_LOADER,
                        !errorComponnet /* do not throw in dev if user provided error component */
                    )
                }

                // suspense-controlled or SSR
                // 对应文档中如果父组件是一个 suspense 那么只返回 promise 结果 其余的控制交给 suspense 处理即可

                if (
                    (__FEATURE_SUSPENSE__ && suspensible && instance.suspense) || (__NODE_JS__ && isInSSRComponentSetup)
                ) {
                    return load().then(comp => {
                        return () => createInnerComp(comp, instance)
                    }).catch(err => {
                        onError(err)
                        return () => errorComponent ? createVNode(errorComponent as ConcreteComponnet, { error: err }) : null
                    })
                }
                
                const loaded = ref(false)
                const error = ref()
                const delayed = ref(!!delay)

                if (delay) {
                    setTimeout(() => {
                        delayed.value = false
                    }, delay)
                }

                if (timeout != null) {
                    setTimeout(() => {
                        if (!loaded.value && !error.value) {
                            const err = new Error(`Async component timed out after ${timeout}ms.`)
                            onError(err)
                            error.value = err
                        }
                    }, timeout)
                }
                load().then(() => {
                    // promise 成功返回后出发 trigger 导致组件更新 重新渲染组件 只不过此时我们已经得到组件内容
                    loaded.value = true
                }).catch(err => {
                    onError(err)
                    error.value = err
                })

                // 返回的函数会被当作组件实例的 render 函数
                return () => {
                    // render 初始之行出发 loaded 的依赖收集
                    if (loaded.value && resolvedComp) {
                        return createInnerComp(resolvedComp, instance)
                    } else if (error.value && errorComponent) {
                        return createVNode(errorComponent as ConcreteComponent, { error: error.value })
                    } else if (loadingComponent && !delayed.value) {
                        return createVNode(loadingComponent as ConcreteComponent)
                    }
                }
            }
        }) as any
    }
    ```
<b>05、resolveComponent</b>

- 官方定义：如果在当前应用实例中可用，则允许按名称解析 component，返回一个 Component。如果没有找到，则返回接收的参数 name。

- 用法
    - 参数：已加载的组件的名称

    ```js
    const app = createApp({})
    app.component('MyComponent', {
        /* ... */
    })

    import { resolveComponent } from 'vue'
    render() {
        const MyComponent = resolveComponent('MyComponent')
    }
    ```

    <b>源码浅析</b>

    GitHub地址：

    - resolveComponent(): 21行 - 27行[7]
    - resolveAsset(): 62行 - 123行[8]

    ```js
    // 接收一个 name 参数，主要还是在 resolveAsset 方法中做了处理，源码位置见上方[7]
    export function resolveComponent(name: string, maybeSelfReference?: boolean): ConcreteComponent | string {
        return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name
    }

    // resolveAsset 源码见上方地[8]
    function resolveAsset(type: AssetTypes, name: string, warnMissing = true, maybeSelfReference = false) {
        // 寻找当前渲染实力，不存在则为当前实例
        const instance = currentRenderingInstance || currentInstance
        if (instance) {
            const Component = instance.type

            // 自我名称具有高级的优先级
            if (type === COMPONENTS) {
                // getComponentName 首先判断传入的 Component 参数是不是函数，如果是函数优先使用 .displayName 属性，其次使用 .name
                const selfName = getComponentName(Component)
                if (
                    // camelize 使用 replace 方法，正则/-(\w)/gname,匹配后 toUpperCase() 转换成大写
                    // capotalize 函数：str.charAt(0).toUppercase() + str.slice(1) 首字母大写 + 处理后的字符
                    selfName && ( selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))
                ) {
                    return Component
                }
            }
            
            const res = 
            // 注册
            // 首先检查实例[type]，它被解析为选项 API
            resolve(instance[type] || (Component as ComponentOptions)[type], name) || 
            // 全局注册
            resolve(instance.appContext[type], name)

            if (!res && maybeSelfReference) {
                return Component
            }

            if (__DEV__ && warnMissing && !res) {
                warn(`Failed to resolve ${type.slice(0, -1)}: ${name}`)
            }
            
            return res
        } else if (__DEV__) {
            // 如果实例不存在，并且在 DEV 环境警告：can only be used in render() or setup()
            warn(`resolve${capitalize(type.slice(0, -1))}` + `can only be used in render() or setup().`)
        }
    }
    ```

<b>06、resolveDynamicComponent</b>

- 官方定义：返回已解析的 Component 或新创建的 VNode,其中组件名称作为节点标签。如果找不到 Component，将发出警告。
- 用法
    - 参数：接受一个参数：component

    ```js
    import { resolveDynamicComponent } from 'vue'
    render() {
        const MyComponent = resolveDynamicComponent('MyComponent')
    }
    ```

    <b>源码浅析</b>
    GitHub地址：

    - resolveDirective(): 43行 - 48行内容 [9]
    - resolveAsset(): 62行 - 123行

    ```js
    // 源码位置位于上方[9]位置处
    // 根据该函数的名称，我们可以知道它用于解析动态组件,在 resolveDynamicComponent 函数内部，若 component 参数是字符串类型，则会调用前面介绍的 resolveAsset 方法来解析组件,
    // 如果 resolveAsset 函数获取不到对应的组件，则会返回当前 component 参数的值。比如 resolveDynamicComponent('div') 将返回 'div' 字符串
    // 源码见上方[1]地址
    export funtion resolveDynamicComponent(coomponent: unknown): VNodeType {
        if (isString(component)) {
            return resolveAsset(COMPONENTS, component, false) || component
        } else {
            // 无效类型将引发警告，如果 component 参数非字符串类型，则会返回 component || NULL_DYNAMIC_COMPONENT 这行语句的执行结果，其中 NULL_DYNAMIC_COMPONENT 的值是一个 Symbol 对象
            return (component || NULL_DYNAMIC_COMPONENT) as any
        }
    }

    // resolveAssets 函数解析见上方 [8] 位置处
    ```

<b>07、resolveDirective</b>

如果在当前应用实例中可用，则允许通过其名称解析一个directive。返回一个Directive。如果没有找到，则返回undefined。

- 用法
    - 第一个参数：已加载的指令的名称。

    <b>源码浅析</b>

    GitHub地址：

    - resolvedirective(): 43行 - 48行内容 [10]
    - resolveAsset(): 62行 - 123行

    ```js
    /**
     * 源码位置见上方[10]位置处
    */
    export function resolveDirective(name: string): Directive | undefined {
        // 然后调用前面介绍的 resolveAsset 方法来解析组件,resolveAsset函数解析见上方[8]位置处
        return resolveAssets(DIRECTIVES, name)
    }
    ```

<b>08、withDirectives</b>

- 官方定义：允许将指令应用于 VNode。返回一个包含应用指令的 VNode。

- 用法

    - 第一个参数：一个虚拟节点，通常使用 h() 创建
    - 第二个参数：一个指令数组，每个指令本身都是一个数组，最多可以定义 4 个索引。

    ```js
    import { withDirectives, resolveDirective } from 'vue'
    const foo = resolveDirective('foo')
    const bar = resolveDirective('bar')

    return withDirectives(h('div'), [
        [foo, this.x],
        [bar, this.y]
    ])
    ```

    <b>源码浅析</b>
    GitHub地址：
    
    - resolveDirective(): 85行 - 114行内容 [1]

    ```js
    export function withDirectives<T extends VNode>(
        vnode: T,
        directives: DirectiveArguments
    ): T {
        const internalInstance = currentRenderingInstance
        if (internalInstance === null) {
            __DEV__ && warn(`withDirectives can only be used inside render functons.`)
            return vnode
        }
        const instance = internalInstance.proxy
        const bindings: DirectiveBinding[] = vnode.dirs || (vnode.dirs = [])
        for(let i=0; i<directives.length; i++) {
            let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i]
            if (isFunction(dir)) {
                dir = {
                    mounted: dir,
                    updated: dir,
                } as ObjectDirective
            }
            bindings.push({
                dir,
                instance,
                value,
                oldValue: void 0,
                arg,
                modifiers
            })
        }
        return vnode
    }
    ```
<b>09、createRenderer</b>

- 官方定义：createRenderer 函数接受两个范型参数：HostNode 和 HostElement，对应于宿主环境中的 Node 和 Element 类型。

- 用法

    - 第一个参数：HostNode 宿主环境中的节点
    - 第二个参数：Element 宿主环境中的元素

    ```js
    // 对于 runtime-dom，HostNode 将是 DOM Node 接口，HostElement 将是 DOM Element 接口。
    // 自定义渲染器可以传入特定于平台的类型，如下所示：

    // createRenderer(HostNode, HostElement),两个通用参数HostNode(主机环境中的节点)和HostElement(宿主环境中的元素)，对应于宿主环境。
    // reateRenderer(使用（可选的）选项创建一个 Renderer 实例。),该方法返回了 baseCreateRenderer
    export function createRenderer<HostNode = RendererNode, HostElement = RendererElement>(options: RendererOptions<HostNode, HostElement>) {
        return baseCreateRenderer<HostNode, HostElement>(options)
    }
    ```

    <b>源码解析</b>
    - createRenderer（）：419 行- 424行内容 [3]
    - baseCreateRenderer()：448 行- 2418行 [4]

    ```js
    export function createRenderer<
    HostNode = RendererNode,
    HostElement = RendererElement
    >(options: RendererOptions<HostNode, HostElement>) {
    return baseCreateRenderer<HostNode, HostElement>(options)
    }

    // baseCreateRenderer这个放2000行的左右的代码量，这里就完整不贴过来了，里面是渲染的核心代码，从平台特性 options 取出相关 API，实现了 patch、处理节点、处理组件、更新组件、安装组件实例等等方法，最终返回了一个renderer对象。
    function baseCreateRenderer(
    options: RendererOptions,
    createHydrationFns?: typeof createHydrationFunctions
    ): any {
    // compile-time feature flags check
    if (__ESM_BUNDLER__ && !__TEST__) {
        initFeatureFlags()
    }

    if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
        const target = getGlobalThis()
        target.__VUE__ = true
        setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__)
    }

    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        forcePatchProp: hostForcePatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        setScopeId: hostSetScopeId = NOOP,
        cloneNode: hostCloneNode,
        insertStaticContent: hostInsertStaticContent
    } = options
    ...
    ...
        ...
    // 返回 render hydrate createApp三个函数，生成的 render 传给 createAppAPI ，hydrate 为可选参数，ssr 的场景下会用到；
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    }
    }
    ```

<b>10、nextTick</b>

- 官方定义：将回调推迟到下一个 DOM 更新周期之后执行。在更改了一些数据以等待 DOM 更新后立即使用它

```js
import { createApp, nextTick } from 'vue'

const app = createApp({
    setup() {
        const message = ref('Hello!')
        const changeMessage = asynv newMessage => {
            message.value = newMessage
            await nextTick()
            console.log('Now DOM is updated')
        }
    }
})
```

<b>源码浅析</b>

GitHub地址：

- nextTick()：42行 - 48行内容

```js
// 源码位置在上方

// 这里直接创建一个异步任务，但是改变dom属性也是异步策略，怎么保证dom加载完成
// Vue2.x是 会判断浏览器是否支持promise属性 -> 是否支持MutationObserver -> 是否支持setImmediate  -> 都不支持使用setTimeout，Vue3不再支持IE11，所以nextTick直接使用Promise

// Vue 异步执行 DOM 更新。只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变。如果同一个 watcher 被多次触发，只会被推入到队列中一次。这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作上非常重要。然后，在下一个的事件循环“tick”中，Vue 刷新队列并执行实际 (已去重的) 工作。

export function nextTick(
  this: ComponentPublicInstance | void,
  fn?: () => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

// 你设置vm.someData = 'new value'，该组件不会立即重新渲染。当刷新队列时，组件会在事件循环队列清空时的下一个“tick”更新。如果你想在 DOM 状态更新后做点什 ，可以在数据变化之后立即使用Vue.nextTick(callback) 。

```

<b>11、mergeProps</b>

- 官方定义：将包含 VNode prop 的多个对象合并为一个单独的对象。其返回的是一个新创建的对象，而作为参数传递的对象则不会被修改。

- 用法

    - 参数：可以传递不限数量的对象

    ```js
    import { h, mergeProps } form 'vue'

    export default {
        inheritAttrs: false,
        render() {
            const props = mergeProps({
            // 该 class 将与 $attrs 中的其他 class 合并。
            class: 'active'
            }, this.$attrs)
            return h('div', props)
        }
    }
    ```

    <b>源码浅析</b>

    GitHub地址：

    - mergeProps()：687行 - 712行

    ```js
    export function mergeProps(...args: (Data & VNodeProps)[]) {
        // extend就是Object.assign方法， ret合并第一个参数为对象
        const ret = extend({}, args[0])
        // 遍历args参数
        for (let i = 1; i < args.length; i++) {
            const toMerge = args[i]
            for (const key in toMerge) {
            if (key === 'class') {
                // 合并class
                if (ret.class !== toMerge.class) {
                ret.class = normalizeClass([ret.class, toMerge.class])
                }
            } else if (key === 'style') {
                // 合并style
                ret.style = normalizeStyle([ret.style, toMerge.style])
            } else if (isOn(key)) {、
                // 判断是不是以 on开头的
                const existing = ret[key]
                const incoming = toMerge[key]
                if (existing !== incoming) {
                // 如果第一个参数中不存在,则合并，否则新增
                ret[key] = existing
                    ? [].concat(existing as any, incoming as any)
                    : incoming
                }
            } else if (key !== '') {
                // key不为空则添加属性
                ret[key] = toMerge[key]
            }
            }
        }
        return ret
    }
    ```

<b>12、useCssModule</b>

- 官方定义：允许在 setup 的单文件组件函数中访问 CSS 模块。

- 用法

    - 参数：CSS 模块的名称。默认为 '$style'

    ```js
    // useCssModule 只能在 render 或 setup 函数中使用。
    // 这里的name不止可以填写$style,
    /*
    *<style module="aaa"
    * ...
    *</style>
    */
    // 这样就可以使用 const style = useCssModule(‘aaa'),来获取相应内容

    <script>
        import { h, useCssModule } from 'vue'
        export default {
            setup () {
                const style = useCssModule()
                return () => h('div', {
                class: style.success
                }, 'Task complete!')
            }
        }
    </script>
    ```
    ```css
    <style module>
        .success {
            color: #090;
        }
    </style>

    // 在 <style> 上添加 module 后， $style的计算属性就会被自动注入组件。
    <style module>
        .six
            color: red;
        }
        .one
            font-size:62px;
        }
    </style>
    ```
    ```html
    // 添加model后可以直接使用$style绑定属性
    <template>
        <div>
            <p :class="$style.red">
                hello red!
            </p>
        </div>
    </template>
    ```

<b>源码解析</b>

GitHub地址：

- useCssModule()：1行 - 30行

```js
import { warn, getCurrentInstance } from '@vue/runtime-core'
import { EMPTY_OBJ } from '@vue/shared'

// 取出 this.$style 
export function useCssModule(name = '$style'): Record<string, string> {
  /* 如果是istanbul覆盖率测试则跳出 */
  if (!__GLOBAL__) {
    // 获取当前实例
    const instance = getCurrentInstance()!
    if (!instance) {
      // useCssModule 只能在 render 或 setup 函数中使用。
      __DEV__ && warn(`useCssModule must be called inside setup()`)
      // EMPTY_OBJ是使用Object.freeze()冻结对象
      return EMPTY_OBJ
    }
    const modules = instance.type.__cssModules
    // 如果不存在css模块，警告
    if (!modules) {
      __DEV__ && warn(`Current instance does not have CSS modules injected.`)
      return EMPTY_OBJ
    }
    const mod = modules[name]
    // 如果不存在未找到name的css模块，警告
    if (!mod) {
      __DEV__ &&
        warn(`Current instance does not have CSS module named "${name}".`)
      return EMPTY_OBJ
    }
    return mod as Record<string, string>
  } else {
    if (__DEV__) {
      warn(`useCssModule() is not supported in the global build.`)
    }
    return EMPTY_OBJ
  }
}
```

<b>13、version</b>

- 官方定义：以字符串形式提供已安装的 Vue 的版本号。

```js
// vue-next/packages/vue/package.json 中的version 为3.1.2，使用.split('.')[0]，得出3
const version = Number(Vue.version.split('.')[0])
if (version === 3) {
  // Vue 3
} else if (version === 2) {
  // Vue 2
} else {
  // 不支持的 Vue 的版本
}
```



