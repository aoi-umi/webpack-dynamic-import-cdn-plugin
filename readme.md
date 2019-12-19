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
