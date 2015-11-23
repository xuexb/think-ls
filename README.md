# think-ls

> 方便的使用`localstorage`存放静态资源

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
        // 以id对应uri路径的形式
        id: 'uri'
    },

    // js配置
    js: {
        id: 'uri'
    },

    // 选项配置
    options: {
        // 开始标签
        open: '{%',

        // 结束标签
        close: '%}'
    }
}
```

### 模板调用

```
调用css
<%css('id')%>

调用js
<%js('id')%>
```

### 主动编译

```js
var ls = require('think-ls');
new ls().build().then(function(a){
    console.log('编译ls结束~');
});
```

## LICENSE

MIT