# think-ls

> 基于`thinkjs 2.x`

方便的使用`localstorage`存放静态资源，思路点这里：[设计localStorage更新](https://xuexb.com/html/286.html)

## 使用

### 下载安装

```
npm install think-ls
```

### 引用和配置

```js
// middleware.js里注册
import ls from 'think-ls';
think.middleware('think-ls', ls);

// hook.js里配置
view_filter: ['think-ls']

// config/ls.js 配置
{
    // 是否开启
    on: true,

    // css配置
    css: {
        // 以 id:uri路径 的形式, uri以 think.RESOURCE_PATH 为起始路径
        id: '/static/dist/a.css'
    },

    // js配置
    js: {
        id: '/static/dist/a.js',
        global: '/static/dist/b.js'
    },

    // 可选配置
    options: {
        // 开始标签
        open: '{%',

        // 结束标签
        close: '%}'
    }
}
```

### 加载静态js

在`模板调用`之前加载`static/LS.js`到模板中，一般加载在`<head>`结束前

### 模板调用

```
调用css
<%css('id')%>

调用js
<%js('id')%>
```

### 主动编译

> 主动编译一般在资源被修改后触发，这样可以把资源缓存起来，读取页面模板调用时可以快速判断版本并加载文件

```js
// 该代码需要在thinkjs实例化后调用
var ls = require('think-ls');
new ls().build().then(function(a){
    console.log('编译ls结束~');
});
```

## LICENSE

MIT