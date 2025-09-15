// DEBUG:
/* eslint-disable no-console */

import fs from "node:fs/promises";

export type ResourceFiles = {
    appDir: string;
    appMain: string;
    workbenchHTML: string;
};

export async function revertVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("revertVibrancy", resourceFiles);
}

async function modifyElectronJS(filePath: string) {
    let electronJSFile = await fs.readFile(filePath, { encoding: "utf-8" });

    // add visualEffectState option to enable vibrancy while VSCode is not in focus (macOS only)
    // https://github.com/illixion/vscode-vibrancy-continued/issues/36
    // vibrancy-continued v1.1.19, v1.1.20
    if (!electronJSFile.includes("visualEffectState")) {
        electronJSFile = electronJSFile.replace(/experimentalDarkMode/g, "visualEffectState:\"active\",experimentalDarkMode");
    }
}

async function installRuntimePatch() {
    // refer to
    // installJs
    // generateNewJS

    // 不需要注入 vscode_vibrancy_plugin，直接在 runtime 去使用 themeCSS
    // 模板替换，试试 ast-grep

    // 直接在 main.js 里面追加 runtime 的代码 IIFE
    // TODO: trust type 要在这里创建什么
}

async function installWorkbenchHTML() {
    // workbench add CSP trustedTypes

    // 用 ast grep 来注入 CSP
}

export async function applyVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("applyVibrancy", resourceFiles);

    await modifyElectronJS(resourceFiles.appMain);

    installRuntimePatch();

    installWorkbenchHTML();
}
