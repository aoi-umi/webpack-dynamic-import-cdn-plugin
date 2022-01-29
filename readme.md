# webpack-dynamic-import-cdn-plugin

> support webpack5

## usage

``` ts 
import { DynamicImportCdnPlugin } from "webpack-dynamic-import-cdn-plugin"; 
new DynamicImportCdnPlugin({
  urlPrefix: 'https://unpkg.com',
  // split: '', // default @
  // noRoot: false
  css: {
    "iview/dist/styles/iview.css": "/iview@3.5.4/dist/styles/iview.css"
    //"iview/dist/styles/iview.css": { url: "/iview@3.5.4/dist/styles/iview.css", urlPrefix: 'https://unpkg.com' }

  }, 
  js: {
    vue: {
      moduleName: "Vue",
      url: "/vue@2.6.10/dist/vue.min.js",
      urlPrefix: '',
      // deprecated
      // noUrlPrefix: true
    },
    'vue-router': {
      moduleName: 'VueRouter',
      package: 'vue-router',
      version: '3.0.2',
      root: '/dist',
      url: '/vue-router.min.js',
    },
  }
}); 
```

css depend on pkg `mini-css-extract-plugin`

css 需要依赖 `mini-css-extract-plugin` 插件，(webpack4仅在build模式生效)

![size](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/size.png)

![example-vue](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/sample-vue.gif)

不同cdn格式不同，
例如：  
https://www.jsdelivr.com  
https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.min.js  

https://cdnjs.com  
https://cdnjs.cloudflare.com/ajax/libs/vue/2.6.10/vue.min.js  

``` ts
import { DynamicImportCdnPlugin } from "webpack-dynamic-import-cdn-plugin"; 
new DynamicImportCdnPlugin({
  urlPrefix: 'https://cdn.jsdelivr.net',
  js: {
    vue: {
      moduleName: "Vue",
      package: 'vue',
      version: '2.6.10',
      root: '/dist',
      url: "/vue.min.js",
    },
  }
});

切换到cdnjs.com =>

new DynamicImportCdnPlugin({
  urlPrefix: 'https://cdnjs.cloudflare.com',
  split: '/',
  noRoot: true
  js: {
    vue: {
      moduleName: "Vue",
      package: 'vue',
      version: '2.6.10',
      root: '/dist',
      url: "/vue.min.js",
    },
  }
});
```


