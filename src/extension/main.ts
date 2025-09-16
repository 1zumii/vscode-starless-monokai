// DEBUG:
/* eslint-disable no-console */

import fs from "node:fs/promises";
import { getAppType, getPlatformType } from "./utils/env";

export type ResourceFiles = {
    appDir: string;
    appMain: string;
    workbenchHTML: string;
};

const INJECT_TRUST_TYPE = "vscodeVibrancy";

/**
 * patch `vs/code/electron-(sandbox|browser)/workbench.html`,
 * register Content Security Policy: Trust Types
 */
async function installWorkbenchHTML(filePath: string) {
    // DEBUG:
    if (true) {
        return;
    }

    // workbench add CSP trustedTypes

    // NOTE:
    // 用 ast grep 来注入 trustedTypes

    console.log(filePath, INJECT_TRUST_TYPE);
}

async function uninstallWorkbenchHTML(filePath: string) {
    // DEBUG:
    if (true) {
        return;
    }

    console.log(filePath, INJECT_TRUST_TYPE);
}

/**
 * patch `out/main.js`, add effect:
 * - visualEffectState
 * - TODO: runtime
 */
async function installRuntimePatch(filePath: string) {
    /**
     * not support windows yet, `win.setBackgroundMaterial` requires:
     * - Windows 11 22H2+
     * - Electron 34+
     */

    // DEBUG:
    if (true) {
        return;
    }

    let jsFileContent = await fs.readFile(filePath, { encoding: "utf-8" });

    /**
     * add visualEffectState option to enable vibrancy while VSCode is not in focus (macOS only)
     * https://github.com/illixion/vscode-vibrancy-continued/issues/36
     * vibrancy-continued v1.1.19, v1.1.20
     */
    if (!jsFileContent.includes("visualEffectState")) {
        jsFileContent = jsFileContent.replace(/experimentalDarkMode/g, "visualEffectState:\"active\",experimentalDarkMode");
    }

    // NOTE:
    // https://github.com/EYHN/vscode-vibrancy/blob/master/runtime/index.js

    // refer to
    // installJs
    // generateNewJS

    // 不需要注入 vscode_vibrancy_plugin，直接在 runtime 去使用 themeCSS
    // 模板替换，试试 ast-grep

    // 直接在 main.js 里面追加 runtime 的代码 IIFE

    // 或者直接用 tsdown 把 CSS 和 runtime 代码 build 并使用 oxc-minify（根据参数使用？）

    // trust type 要在这里创建 style element 到 workbench html 的 document 上
    // 代码在 injectHTML
    // 1. themeCSS -> vib-ext:themes/default dark.css
    //  默认的样式覆盖
    // 2. importCSS -> vib-ext:fixes/cursor dark.css
    //  根据特定平台 patch
    // 3. 考虑 merge css

    // runtime 针对于 macos 平台
    // electron.app.on('browser-window-created') -> 'dom-ready'
    // -> window.setVibrancy(type);
    // -> hack 操作 setBound 强制刷新 macOS 窗口的 vibrancy 效果（？）
}

async function uninstallRuntimePatch(filePath: string) {
    // DEBUG:
    if (true) {
        return;
    }

    console.log(filePath);
}

export async function revertVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("revertVibrancy", resourceFiles);

    await uninstallWorkbenchHTML(resourceFiles.workbenchHTML);

    await uninstallRuntimePatch(resourceFiles.appMain);
}

export async function applyVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("applyVibrancy", resourceFiles);

    console.log(getPlatformType());
    console.log(getAppType());

    await installRuntimePatch(resourceFiles.appMain);

    await installWorkbenchHTML(resourceFiles.workbenchHTML);
}
