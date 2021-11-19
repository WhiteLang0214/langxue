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

