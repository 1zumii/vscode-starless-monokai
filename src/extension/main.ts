// DEBUG:
/* eslint-disable no-console */

import fs from "node:fs/promises";
import { getAppType, getPlatformType } from "./utils";

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

    // 用 ast grep 来注入 CSP

    console.log(filePath, INJECT_TRUST_TYPE);
}

/**
 * patch `out/main.js`, add effect:
 * - visualEffectState
 * - TODO: runtime
 */
async function installRuntimePatch(filePath: string) {
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

    // refer to
    // installJs
    // generateNewJS

    // 不需要注入 vscode_vibrancy_plugin，直接在 runtime 去使用 themeCSS
    // 模板替换，试试 ast-grep

    // 直接在 main.js 里面追加 runtime 的代码 IIFE

    // 或者直接用 tsdown 把 CSS 和 runtime 代码 build 并使用 oxc-minify（根据参数使用？）

    // TODO: trust type 要在这里创建什么

    // themeCSS -> vib-ext:themes/default dark.css
    // importCSS -> vib-ext:fixes/cursor dark.css
}

export async function revertVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("revertVibrancy", resourceFiles);
}

export async function applyVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("applyVibrancy", resourceFiles);

    console.log(getPlatformType());
    console.log(getAppType());

    await installRuntimePatch(resourceFiles.appMain);

    await installWorkbenchHTML(resourceFiles.workbenchHTML);
}
