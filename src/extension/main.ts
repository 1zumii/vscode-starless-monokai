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

    // 有没有更好的 模板引擎
    // https://github.com/bgub/eta
}

export async function applyVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    console.log("applyVibrancy", resourceFiles);

    await modifyElectronJS(resourceFiles.appMain);

    installRuntimePatch();
}
