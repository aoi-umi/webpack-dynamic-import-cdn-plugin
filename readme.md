# webpack-dynamic-import-cdn-plugin

## usage

``` ts
import { DynamicImportCdnPlugin } from "webpack-dynamic-import-cdn-plugin";
new DynamicImportCdnPlugin({
  urlPrefix: 'https://unpkg.com',
  css: {
    "iview/dist/styles/iview.css": "/iview@3.5.4/dist/styles/iview.css"
    //"iview/dist/styles/iview.css": { url: "https://unpkg.com/iview@3.5.4/dist/styles/iview.css", noUrlPrefix: true }
  },
  js: {
    vue: {
      moduleName: "Vue",
      url: "/vue@2.6.10/dist/vue.min.js",
      // noUrlPrefix: true
    }
  }
});
```

css depend on pkg `mini-css-extract-plugin`  
css 需要依赖 `mini-css-extract-plugin` 插件，且仅在build模式生效

![size](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/size.png)

![example-vue](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/sample-vue.gif)
