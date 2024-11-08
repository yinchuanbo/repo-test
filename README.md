## 安装 Deno

- window: `winget install DenoLand.Deno`

## repo 引用方式

- js

```js
import { getHeaders } from "@js/api.js";
console.log("getHeaders", getHeaders());
```

- scss

```scss
@use "../../../../repo/scss/button.scss";
```

- ejs

```html
<%- include("../../repo/ejs/button.ejs") %>
```