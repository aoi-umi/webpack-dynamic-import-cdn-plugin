# webpack-dynamic-import-cdn-plugin

## usage

```ts
import { DynamicImportCdnPlugin } from "webpack-dynamic-import-cdn-plugin";
new DynamicImportCdnPlugin({
  css: {
    "iview/dist/styles/iview.css":
      "https://unpkg.com/iview@3.5.4/dist/styles/iview.css"
  },
  js: {
    vue: {
      moduleName: "Vue",
      url: "https://unpkg.com/vue@2.6.10/dist/vue.min.js"
    }
  }
});
```
css depend on pkg `mini-css-extract-plugin`

![size](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/size.png)

![example-vue](https://raw.githubusercontent.com/aoi-umi/note/master/git%E6%96%87%E6%A1%A3/webpack-dynamic-import-cdn-plugin/sample-vue.gif)