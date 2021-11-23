# 前端性能优化

![这是图片](/assets/img/optimize.png "性能优化")

# 定位

## 1.1 技术选型

    复杂框架适合处理复杂业务，类似于 react 和 vue。

    如果研发H5 、PC 展示等简单业务的时候，javascript配合轻量级的插件更合适。

## 1.2 network

    从 chrome 开发者工具中，我们可以看到 network 的一些信息：

    请求资源 size
    请求资源时长
    请求资源数量
    接口响应时长
    接口发起数量
    接口报文 size
    接口响应状态
    瀑布图

<b>瀑布图</b>

![这是图片](/assets/img/network.png "network")

开发者工具中 waterfall纵列 

瀑布图是一个级联图，展示了浏览器如何加载资源并渲染成网页。图中的每一行都是一次单独的浏览器请求。这个图越长，说明加载网页过程中所发的请求越多，每一行的宽度，代表浏览器发出请求并下载该资源的过程中所耗费的时间。它的侧重点在于分析网路链路

瀑布图颜色说明：

```
- DNS Lookup[深绿色] - 在浏览器和服务器进行通信之前，必须经过 DNS 查询，将域名转换成 IP 地址，在这个阶段，你可以处理的东西很少。但并非所有的请求都需要经过这一阶段。

- Initial Connection[橙色] - 在浏览器发送请求之前，必须建立 TCP 连接。这个过程仅仅发生在瀑布图中的开头几行，否则这就是个性能问题.

- SSL/TLS Negotiation[紫色] - 如果你的页面是通过 SSL/TLS 这类安全协议加载资源，这段时间就是浏览器建立安全连接的过程。目前 Google 将 HTTPS 作为其搜索排名因素之一，SSL/TLS 协商的使用变得越来越普遍了。

- Time To First Byte(TTFB)[绿色] - TTFB 是浏览器请求发送到服务器的时间 + 服务器处理请求时间 + 响应报文的第一字节到达浏览器的时间。我们用这个指标来判断你的 web 服务器是否性能不够，或者说是否需要使用 CDN。

- Downloading[蓝色] - 这是浏览器用来下载资源所用的时间，这段时间越长，说明资源越大。理想状态下，可以通过控制资源的大小来控制这段时间的长度。

```

除了瀑布图的长度之外，判断一个瀑布图的状态是否健康的其他办法：

```
- 首先，减少所有资源的加载时间，亦减小瀑布图的宽度。瀑布图越窄，网站的访问速度越快

- 其次，减少请求数量，也就是降低瀑布图的高度，瀑布图越矮越好

- 最后，通过优化资源请求顺序来加快渲染时间。从图上看，就是将绿色的“开始渲染”线向左移。这条线向左移动的越远越好。

```
    这样，我们就可以从 network 的角度去排查“慢”的问题。

## 1.3 webpack-bundle-analyzer

项目构建后生成的 bundle 包是压缩后的。webpack-bundle-analyzer 是一款包分析工具。

![这是图片](/assets/img/webpack-bundle-analyzer.png "webpack-bundle-analyzer")

从上图来看，bundle 包呗解析的一览无余。其中模块面积占的越大说明在 bundle 包中 size 越大。<b>重点优化</b>

它能够排查出来的信息有：

- 显示包中所有打入的模块
- 显示模块 size 及 gzip 后的 size

排查包中的模块情形是非常必要的，通过 webpack-bundle-analyzer 来排查出一些无用的模块，过大的模块。然后进行优化。以减少 bundle 包 size，减少加载时长。

<u>安装</u>

```
# NPM 
npm install --save-dev webpack-bundle-analyzer
# Yarn 
yarn add -D webpack-bundle-analyzer
```

<u>使用(as a Webpack-Plugin)</u>

```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
 
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

```
然后构建包完毕后会自动弹出一个窗口展示上图信息

## 1.4 performance

chrome 自带的 performance 模块。先附上一个官网文档传送门：[Performance]()

可以检测很多方面的数据，多数情况的性能排查上用的比较多。想要深入了解，请看官网。

接下来说下 performance 面板中如何排查“慢”的问题，它给我们提供了那些信息呢？先附上一张 performance 的面板图片

![这是图片](/assets/img/performance.png "performance")

从上图中可以分析出一些指标

- FCP/LCP时间是否过长？
- 请求并发情况 是否并发频繁？
- 请求发起顺序 请求发起顺序是否不对？
- javascript 执行情况 执行是否过慢？

这些指标都是需要重点关注的，当然 performance 的功能不止于此

## 1.5 performanceNavigtionTiming

获取各个阶段的响应时间，我们所用到的接口是 performanceNavigtionTiming 接口

performanceNavigtionTiming 提供了用于存储和检索有关浏览器文档事件的指标的方法和属性。例如，此接口可用于确定加载或写在文档需要多少时间

```
function showNavigationDetails() {
  const [entry] = performance.getEntriesByType("navigation");
  console.table(entry.toJSON());
}
```

使用这个函数，我们可以获取各个阶段响应时间，如图

![这是图片](/assets/img/performanceNavigtionTiming.png "performanceNavigtionTiming")

**参数说明**

navigationStart 加载起始时间

redirectStart 重定向开始时间（如果发生了HTTP重定向，每次重定向都和当前文档同域的话，就返回开始重定向的fetchStart的值。其他情况，则返回0）

redirectEnd 重定向结束时间（如果发生了HTTP重定向，每次重定向都和当前文档同域的话，就返回最后一次重定向接受完数据的时间。其他情况则返回0）

fetchStart 浏览器发起资源请求时，如果有缓存，则返回读取缓存的开始时间

domainLookupStart 查询DNS的开始时间。如果请求没有发起DNS请求，如keep-alive，缓存等，则返回fetchStart

domainLookupEnd 查询DNS的结束时间。如果没有发起DNS请求，同上

connectStart 开始建立TCP请求的时间。如果请求是keep-alive，缓存等，则返回domainLookupEnd

(secureConnectionStart) 如果在进行TLS或SSL，则返回握手时间

connectEnd 完成TCP链接的时间。如果是keep-alive，缓存等，同connectStart

requestStart 发起请求的时间

responseStart 服务器开始响应的时间

domLoading 从图中看是开始渲染dom的时间，具体未知

domInteractive 未知

domContentLoadedEventStart 开始触发DomContentLoadedEvent事件的时间

domContentLoadedEventEnd DomContentLoadedEvent事件结束的时间

domComplete 从图中看是dom渲染完成时间，具体未知

loadEventStart 触发load的时间，如没有则返回0

loadEventEnd load事件执行完的时间，如没有则返回0

unloadEventStart unload事件触发的时间

unloadEventEnd unload事件执行完的时间

**Web性能，会用到的时间参数：**

DNS解析时间： domainLookupEnd - domainLookupStart

TCP建立连接时间： connectEnd - connectStart

白屏时间： responseStart - navigationStart

dom渲染完成时间： domContentLoadedEventEnd - navigationStart

页面onload时间： loadEventEnd - navigationStart

根据这些时间参数，我们就可以判断哪一阶段对性能有影响。

## 1.6 抓包

有一些业务状况是没有上述的一些调试工具，可以利用抓包工具进行对页面信息的抓取，上述通过 chrome 工具排查出来的指标，也可以通过抓包工具进行抓取。

## 1.7 性能测试工具

- Pingdom

- Load Impact

- WebPage Test

- Octa Gate Site

- Free Speed Test

# 2. 优化

前端的优化种类繁多，主要包含三个方面的优化：<b>网络优化（对加载时所消耗的网络资源优化）</b>，<b>代码优化（资源加载完后，脚本解释执行的速度）</b>，<b>框架优化（选择性能较好的恶框架，比如 benchmark）</b>

## 2.1 tree shaking

中文（摇树），webpack 构建优化中重要一环。摇树用于清除我们项目中的一些无用代码，它以来于 ES 中的模块语法。

比如日常使用 lodash 的时候

```
import _ from 'lodash'
```

如果如上引用 lodash 库，在构建包的时候会把整个 lodash 包打入到我们的 bundle 包中的。

```
import _isEmpty from 'lodash/isEmpty';
```

如果如上引用 lodash 库，在构建包的时候只会把 isEmpty 这个方法抽离出来再打入到我们的 bundle 包中。

这样就会大大减少我们包的 size。所以在日常饮用第三方库的时候，需要注意导入的防护。

如果开启摇树

在 webpack4.x 中默认对 tree-shaking 进行了支持。在 webpack2.x 中使用 tree-shaking: [传送门](https://zhuanlan.zhihu.com/p/28725181)

## 2.2 split chunks(分包)

在没配置任何东西的情况下，webpack4就智能的帮你做了代码分包。入口文件依赖的文件都被打包进 main.js，那些 大于30kb 的第三方包，如：echarts、xlsx、dropzone 等都被单独打包成了一个个独立的 bundle。

其它被我们设置了异步加载的页面或者组件变成了一个个 chunk，也就是被打包成独立的 bundle。

它内置的代码分割策略是这样的：

- 新的 chunk 是否被共享或者是来自 node_modules 的模块
- 新的 chunk 体积在压缩之前是否大于 30kb
- 按需加载 chunk 的并发请求数量小于等于 5个
- 页面初始加载时的并发请求数量大于等于 3个

可以根据项目环境更改配置。配置代码如下：

```js
splitChunks({
  cacheGroups: {
    vendors: {
      name: `chunk-vendors`,
      test: /[\\/]node_modules[\\/]/,
      priority: -10,
      chunks: 'initial',
    },
    dll: {
      name: `chunk-dll`,
      test: /[\\/]bizcharts|[\\/]\@antv[\\/]data-set/,
      priority: 15,
      chunks: 'all',
      reuseExistingChunk: true
    },
    common: {
      name: `chunk-common`,
      minChunks: 2,
      priority: -20,
      chunks: 'all',
      reuseExistingChunk: true
    },
  }
})

```

没有使用 webpack4.x 版本的项目，依然可以通过**按需加载**的形式进行分包，使得我们的包分散开，提升加载性能。

按需加载也是一钱分饱的重要手段之一

推荐文章 [webpack如何使用按需加载](https://juejin.cn/post/6844903718387875847)

## 2.3 拆包

与分包不同。上面分包的 bundle 包解析中有个有趣的现象，上面项目的技术栈是 react，但是 bundle 包中并没有 react、react-dom、react-router 等。

因为把这些插件“拆”开了。并没有一起打在 bundle 中。而是放在 CDN 上。下面举个例子来解释一下。

假设：原本 bundle 包为 2M，一次请求拉取。拆分为 bundle（1M） + react桶（CDN）(1M) 两次请求并发拉取

从这个角度看，1+1的模式拉取资源更快

换一个角度来说，全量部署项目的情况，每次部署 bundle 包都将重新拉取。比较浪费资源。react 桶的方式可以命中强缓存，这样的话，就算全量部署也只需要重新拉取左侧 1M 的 bundle 包即可，节省了服务器资源，优化了加载速度。

注意：在本地开发过程中，react 等资源建议不要引入 CDN，开发过程中刷新频繁，会增加 CDN 服务器压力，走本地就好。

## 2.4 gzip

服务端配置 gzip 压缩后可大大缩减资源大小

Nginx 配置方式

```nginx
http {
    gzip on;
    gzip_buffers 32 4k;
    gzip_comp_level 6;
    gzip_min_length 100;
    gzip_types application/javascript text/css text/xml;
    gaip_disable "MSIE [1-6]\.";
    gaip_vary on;
}
```

配置完成后在 response header 中可查看

![这是图片](/assets/img/gzip.png "gzip")

## 2.5 图片压缩

开发中比较重要的一个环节，压缩图片的常用方式

- [智图压缩](https://zhitu.isux.us/)（百度很难搜到官网了，免费、批量、好用）
- [tinypng](https://tinypng.com/)（免费、批量、速度快）
- fireworks 工具压缩像素点和尺寸（自己动手，掌握尺度）
- 找 UI 压缩

图片压缩是常用的手法，因为设备像素点的关系，UI 给予的图片一般都是 x2,x4的，所以压缩就非常有必要

## 2.6 图片分割

如果页面中有一张效果图，比如真机渲染图，UI 不让压缩，这时候可以考虑下分割图片。

建议单张图片的大小不要超过 100k，我们在分割完图片后，通过布局再拼接在一起。可以提高图片加载效率

注意：分割后的每张图片一定要给 height，否则网速慢的情况下样式会塌陷。

## 2.7 sprite（雪碧图/精灵图）

在网站中有很多小图片的时候，一定要把这些小图片合并为一张大的图片，然后通过 background 分割到需要展示的图片

好处是：

浏览器请求资源的时候，同源域名请求资源的时候有最大并发限制，chrome 为6个。就比如页面上有10个相同 CDN 域名小图片，那么需要发起10次请求去拉取。第一次并发请求回来后，发起第二次并发。 

如果把10个小图片合并为一张大图片的话，那么只需要一次请求即可拉取。减少服务器压力，减少并发，减少请求次数。

## 2.8 CDN（内容分发网络）

服务求是中心化的，CDN 是“去中心化的”

在项目中有很多东西都是放在 CDN 上的，比如：静态文件，音频，视频，js资源，图片。那么为什么用 CDN 会让资源加载变快呢？

举个例子：

> 以前买火车票大家都只能去火车站买，后来买火车票可以在楼下的火车票代售点买。

所以静态资源建议放在 CDN 上，可以加快资源加载的速度

## 2.9 懒加载

懒加载也叫延迟加载，指的是在长网页中延迟加载图像，是一种非常好的优化网页性能的方式。

当可视区域没有滚到资源需要加载的地方时候，可视区域外的资源就不会加载

可以减少服务器负载，常适用于图片很多，页面较长的业务场景中

如果使用：

- [图片懒加载](https://juejin.cn/post/6844903688390049800)

- [layzr.js](https://github.com/callmecavs/layzr.js)

## 2.10 iconfont(字体图标)

好处：
- 矢量
- 轻量
- 易修改
- 不占用图片资源请求

就像上面的雪碧图，如果都用字体图标来替换的话，一次请求都免了，可以直接打到 bundle 包中。

使用前提是 UI 建立好字体图标库

## 2.11 逻辑后移

逻辑后移是一种比较常见的优化手段，用一个打开文章网站的操作来举个例子

没有逻辑后移处理的请求顺序是这样的：

![逻辑后移](/assets/img/ljhy_1.png "逻辑后移")

页面的展示主题是文章展示，如果文章展示的请求靠后了，那么渲染文章出来的时间必然靠后，因为有可能因为请求阻塞等情况，影响请求响应情况，如果超过一次并发的情况的话，会更加的慢。如图的这种情况也是我们的项目中发生过的

很明显我们应该把主题“请求文章”接口前移，把一些非主体的请求逻辑后移。这样的话可以尽快的把主体渲染出来，就会块很多。

优化后的顺序是这样的

![逻辑后移](/assets/img/ljhy_2.png "逻辑后移")

在平常的开发中建议时常注意逻辑后移的情况，突出主体逻辑。可以极大的提升用户体验。

## 2.12 算法复杂度

在数据量大的应用场景中，需要着重注意算法复杂度问题

在这个方面可以参考 [javascript算法之复杂度分析](https://www.jianshu.com/p/ffbb25380904) 这篇文章

如上面 performance 解析出的 javascript 执行指标上，可以推测出来你的 code 执行效率如何，如果执行时间过长就要考虑一下是否要优化一下复杂度了

> 在时间换空间，空间换时间的选择上，要根据业务场景来进行取舍

## 2.13 组件渲染

拿 react 举例，组件分割方面不要太深。需要控制组件的渲染，尤其是深层组件的 reander

优化组件渲染的方式：

- 生命周期控制 - 比如 react 的 shouldComponentUpdate 来控制组件渲染
- 官网提供的 api-PureComponent
- 控制注入组件的参数
- 分配组件唯一key

没有必要的渲染是对性能的极大浪费

## 2.14 node middleware(node 中间件)

中间件主要是指封装所有 http 请求细节处理的方法。一次 Http 请求通常包含很多工作，如记录日志、ip过滤、查询字符串、请求体解析、Cookie处理、权限验证、参数验证、异常处理等，单对于 Web 应用而言，并不希望接触到这么多细节性的处理，因此引入中间件来简化和隔离这些基础设置与业务逻辑之间的细节，让我们能够关注在业务的开发上，以达到提升开发效率的目的

使用 node middleware 合并请求。减少请求次数。这种方法非常实用

## 2.15 web worker

Web Worker 的作用，就是为 javascript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢

合理使用 web worker 可以优化复杂计算任务。[阮一峰的入门文章](http://www.ruanyifeng.com/blog/2018/07/web-worker.html)

## 2.16 缓存

缓存的原理是更快读写的存储介质 + 减少 IO + 减少 CPU 计算 = 性能优化。而性能优化的第一定律就是：优先考虑使用缓存

缓存的主要手段有

- 浏览器缓存
- CDN
- 反向代理
- 本地缓存
- 分布式缓存
- 数据库缓存

## 2.17 GPU 渲染

每个网页或多或少都设计到一些 CSS 动画，通常简单的动画对于性能的影响微乎其微，然而如果涉及到稍显复杂的动画，不当的处理方式会使性能问题变得十分突出

像 Chrome、FireFox、Safari、IE9+ 和 最新版本的 Opera 都支持 GPU 加速，当他们检测到页面中某个DOM元素应用了某些 C SS 规则时就会开启

虽然我们可能不想对元素应用 3D 变换，可我们一样可以开启 3D 引擎。例如我们可以用 transform: translateZ(0) 来开启 GPU 加速

只对我们需要实现动画效果的元素应用以上方法，如果仅仅为了开启硬件加速随便乱用，那是不合理的。

## 2.18 Ajax 可缓存

Ajax 在发送的数据成功后，为了提高页面的响应速度和用户体验，会把请求的 URL 和返回的响应结果保存在换村内，当下一次调用 Ajax 发送相同请求（URL和参数完全相同）时，它就会直接从缓存中拿数据。

在进行 Ajax 请求的时候，可以选择尽量使用 get 方法，这样可以使用客户端的缓存，提高请求速度。

## 2.19 Resource Hints

Resource Hints（资源预加载）是非常好的一种性能优化方法，可以大大降低页面加载时间，给用户更加流畅的用户体验

现代浏览器使用大量预测优化技术来预测用户行为和意图，这些技术有预连接、资源与获取、资源预渲染等。

Resource Hints 的思路如下两个：

- 当前将要获取资源的列表
- 通过当前页面或应用的状态、用户历史行为或 session 预测用户行为及必须的资源

实现 Resource Hints 的方法有很多中，可分为基于 link 标签的 DNS-prefetch、subresource、preload、prefetch、跑reconnect、prerender，和本地存储 localStorage。

## 2.20 SSR

渲染过程在服务器端完成，最终的渲染结果 HTML 页面通过 HTTP 协议发送给客户端，又被认为是“同构”或“通用”，如果你的项目有大量的 detail 页面，相互特别频繁，建议选择服务端渲染

服务端渲染（SSR）除了 SEO 还有很多时候用做首屏优化，加快首屏速度，提高用户体验。但是对服务器有要求，网络传输数据量大，占用部分服务器运算资源

Vue 的 Nuxt.js 和 React 的 next.js 都是服务端渲染的方法

## 2.21 UNPKG

UNPKG 是一个提供 npm 包进行 CDN 加速的站点，因此，可以将一些固定了依赖写入 html 模版中，从而提高网页的性能。首先，需要将这些依赖生命为 external，以便 webpack 打包时不从 node_modules 中加载这些资源，配置如下：

```js
    externals: { 'react': 'React' }
```

其次，你需要将所以来的资源写在 html 模版中，这一步需要用到 [html-webpack-plugin](https://link.zhihu.com/?target=https%3A//github.com/jantimon/html-webpack-plugin)

示例：

```js
<% if (htmlWebpackPlugin.options.node_env === 'development') { %>
  <script src="https://unpkg.com/react@16.7.0/umd/react.development.js"></script>
<% } else { %>
  <script src="https://unpkg.com/react@16.7.0/umd/react.production.min.js"></script>
<% } %>
```

这段代码需要注入 node_env，以便在开发的时候能够获得更友好的错误提示。也可以选择一些比较自动的库，来帮助我们完成这样的过程，比如 [webpack-cdn-plugin](https://www.npmjs.com/package/webpack-cdn-plugin) 和 [dynamic-cdn-webpack-plugin](https://github.com/mastilver/dynamic-cdn-webpack-plugin)

[文章来源](https://juejin.cn/post/6904517485349830670#heading-17)