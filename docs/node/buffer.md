
# Buffer

- Buffer 对象用于表示固定长度的字节序列。Buffer 类是 javascript 类的 unit8Array 的子类，并使用额外用例的方法对其进行扩展。

```js

const { Buffer } = require('buffer')

// 创建长度为10 以 0 填充的缓冲区
const b1 = Buffer.alloc(10)
console.log(b1) // <Buffer 00 00 00 00 00 00 00 00 00 00>

// 创建长度为10 使用值为 1 填充的缓冲区
const b2 = Buffer.alloc(10, 1)
console.log(b2) // <Buffer 01 01 01 01 01 01 01 01 01 01>

// 创建长度为 10 的未初始化的缓冲区。
// 这比调用 Buffer.alloc() 快，
// 但返回的缓冲区实例可能包含旧数据，
// 需要使用 fill()、write() 、
// 或其他填充缓冲区内容的函数重写。
const b3 = Buffer.allocUnsafe(10);
console.log(b3) // <Buffer 40 bf e2 0c 01 00 00 00 04 00>

```

- 当在 Buffer 和字符串之间进行转换时，可以指定字符编码。 如果未指定字符编码，则默认使用 UTF-8( 均可 'utf8'、'UTF8' 或 'uTf8')。

```js

const d1 = Buffer.from('012ABCabc', 'utf8')
console.log(d1) // <Buffer 30 31 32 41 42 43 61 62 63>

const d1s = d1.toString()
console.log(d1s) // 012ABCabc

const d2s = d1.toString('hex')
console.log(d2s) // 303132414243616263

const d3s = d1.toString('base64')
console.log(d3s) // MDEyQUJDYWJj

const d4s = Buffer.from('012ABCabc', 'utf16le')
console.log(d4s) // <Buffer 30 00 31 00 32 00 41 00 42 00 43 00 61 00 62 00 63 00>

```

## Blob 类

- Blob 封装了不可变的原始数据，可以在多个工作线程之间安全地共享

- new buffer.Blob([sources[, options]])
    + source: 将存储在 Blob 中的字符串数组、<ArrayBuffer>、<TypedArray>、<DataView> 或 <Blob> 对象、或此类对象的任何组合
    + options: 
        - endings <string> 'transparent' 或 'native' 之一。 当设置为 'native' 时，字符串源部分中的行尾将转换为 require('os').EOL 指定的平台原生的行尾。
        - type <string> Blob 内容类型。 目的是让 type 传达数据的 MIME 媒体类型，但不执行类型格式的验证

## Buffer 类

- Buffer 类是处理二进制数据的全局类型，可以使用多种方式构建