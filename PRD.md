# 需求
## 1. patch runtime js file
path: src/extension/patch-runtime.ts

### temp doc
```rust
// NOTE:
https://github.com/EYHN/vscode-vibrancy/blob/master/runtime/index.js

refer to
installJs
generateNewJS

不需要注入 vscode_vibrancy_plugin，直接在 runtime 去使用 themeCSS
模板替换，试试 ast-grep

直接在 main.js 里面追加 runtime 的代码 IIFE

或者直接用 tsdown 把 CSS 和 runtime 代码 build 并使用 oxc-minify（根据参数使用？）

trust type 要在这里创建 style element 到 workbench html 的 document 上
代码在 injectHTML
1. themeCSS -> vib-ext:themes/default dark.css
 默认的样式覆盖
2. importCSS -> vib-ext:fixes/cursor dark.css
 根据特定平台 patch
3. 考虑 merge css

runtime 针对于 macos 平台
electron.app.on('browser-window-created')
    -> 'dom-ready'
    -> window.setVibrancy(type);
    -> hack 操作 setBound 强制刷新 macOS 窗口的 vibrancy 效果（？）
```

### 1.1. inject variables to runtime
runtime template files: src/extension/runtime-templates/*.tpl.js
使用正则进行替换

#### 想要的效果
把这段替换
```js
// #INJECTION_START
const $Inject = {};
// #INJECTION_END
```
为了这些
```js
if ($Inject.isMacOS()) { /* ... ... */ }
```
期望的结果就是
```js
const $Inject = {
    isMacOS: () => true,
    vibrancyType: () => "under-window",
};
```

### 1.2. 修改 main.js 文件
我希望也是有两个注释内夹着替换的思路，比如：
- 参考的 install
```js
async function installJS() {
    const config = vscode.workspace.getConfiguration("vscode_vibrancy");
    const currentTheme = getCurrentTheme(config);
    const themeConfigPath = path.resolve(__dirname, themeConfigPaths[currentTheme]);
    const themeConfig = require(themeConfigPath);
    const themeStylePath = path.join(__dirname, themeStylePaths[currentTheme]);
    const themeCSS = await fs.readFile(themeStylePath, "utf-8");
    const JS = await fs.readFile(JSFile, "utf-8");

    const imports = await generateImports(config);

    const injectData = {
        os: osType,
        config,
        theme: themeConfig,
        themeCSS,
        imports,
    };

    const base = __filename;
    const newJS = generateNewJS(JS, base, injectData);

    await fs.writeFile(JSFile, newJS, "utf-8");
}
```
- 参考的 uninstall
```js
async function uninstallJS() {
    const JS = await fs.readFile(JSFile, "utf-8");
    const needClean = /\n\/\* !! VSCODE-VIBRANCY-START !! \*\/[\s\S]*?\/\* !! VSCODE-VIBRANCY-END !! \*\//.test(JS);
    if (needClean) {
        const newJS = JS
            .replace(/\n\/\* !! VSCODE-VIBRANCY-START !! \*\/[\s\S]*?\/\* !! VSCODE-VIBRANCY-END !! \*\//, "");
        await fs.writeFile(JSFile, newJS, "utf-8");
    }
    // remove visualEffectState option
    if (knownEditors.includes(vscode.env.appName)) {
        const ElectronJS = await fs.readFile(ElectronJSFile, "utf-8");
        const newElectronJS = ElectronJS
            .replace(/frame:false,transparent:true,experimentalDarkMode/g, "experimentalDarkMode")
            .replace(/visualEffectState:"active",experimentalDarkMode/g, "experimentalDarkMode");
        await fs.writeFile(ElectronJSFile, newElectronJS, "utf-8");
    }
}
```
但是我们可以使用不一样风格的命名，比如不需要是 `/* !! VSCODE-VIBRANCY-START !! */`
在设计时，需要考虑写入后怎么替换
写入的内容是 src/extension/runtime-templates/runtime.tpl.js
最后生成的结果，大概像：
```js
// ... ... 前面的一些原有的代码

// --- STARLESS-MONOKAI-RUNTIME-START ---
(function () {
    我的代码();
})();
// --- STARLESS-MONOKAI-RUNTIME-END ---
```

## 2. 管理 resources
path: src/extension/resources

在 src/extension/resources/index.ts 中，我需要几个函数：
1. 入参是一个 path(output-ext 的根路径)，然后把 resources 下所有的文件都移动到那个路径的 resources 目录下
用来给 outputExtension 的时候，把 build 时没法读到的文件给挪过去
> 需要确认，tsdown 能不能做到强制打包某些路径？不然根据 import 引用关系，是没法引用到 resources 的

2. 一个函数，来获取 resources 里面文件的路径
给 patch runtime 里面的，比如：
```js
fs.readFile(path.resolve(__dirname, "patch-themes", fileName), "utf-8");
```
来用

最终的文件结构：
```md
- output-ext/
    - extension/
        - main.js(包含了 `getResourcePath` 的逻辑)
        - resources/
            - runtime-templates/
            - patch-themes/
```
