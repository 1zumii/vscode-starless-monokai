// DEBUG:
/* eslint-disable no-console */

// gggggeminiii0822@gmail.com
// GGGGGemini920817

import fs from "node:fs/promises";
import { Lang, parse } from "@ast-grep/napi";
import { getAppType, getPlatformType } from "./utils/env";

export type ResourceFiles = {
    appDir: string;
    appMain: string;
    workbenchHTML: string;
};

export const INJECT_TRUST_TYPE = "vscodeVibrancy";

/**
 * patch `vs/code/electron-(sandbox|browser)/workbench.html`,
 * register Content Security Policy: Trust Types
 */
async function installWorkbenchHTML(filePath: string) {
    // 1. Read the HTML file content
    const workbenchHTML = await fs.readFile(filePath, "utf-8");
    // 2. Parse the HTML using the recommended `Lang` enum from ast-grep
    const root = parse(Lang.Html, workbenchHTML).root();
    // 3. Find the CSP meta tag and extract the content attribute value.
    const matchNode = root.find("<meta http-equiv=\"Content-Security-Policy\" content=$CONTENT>");
    const contentValueNode = matchNode?.getMatch("CONTENT");
    const rawContent = contentValueNode?.text();

    // 4. If no match, or if the content attribute is empty, throw an error.
    if (!rawContent) {
        throw new Error(
            "Could not find a valid 'content' attribute in the CSP meta tag. "
            + "This is likely due to an incompatible VS Code update. "
            + "Please check plugin compatibility or file an issue.",
        );
    }
    // 5. Strip quotes from the attribute value.
    const contentAttr = rawContent.slice(1, -1);

    const cspContent = contentAttr;

    // 6. If the CSP already includes the trust type, no modification is needed.
    if (cspContent.includes(INJECT_TRUST_TYPE)) {
        console.log("CSP already includes the required trust type. No changes needed.");
        return;
    }

    // 7. Use a regular expression to find the 'trusted-types' directive.
    const trustTypesRegex = /trusted-types\s+([^;]+)/;
    const match = cspContent.match(trustTypesRegex);

    let newCspContent;

    if (match) {
        // If the 'trusted-types' directive exists, append our type to the existing list.
        const existingTypes = match[1].trim();
        const newTypes = `${existingTypes} ${INJECT_TRUST_TYPE}`;
        newCspContent = cspContent.replace(trustTypesRegex, `trusted-types ${newTypes}`);
    }
    else {
        // If the 'trusted-types' directive does not exist, throw error.
        throw new Error("The 'trusted-types' directive is missing from the Content-Security-Policy.");
    }

    // 8. Generate the new meta tag and the final HTML content.
    const originalMetaTag = matchNode!.text();
    const newMetaTag = originalMetaTag.replace(cspContent, newCspContent);
    const newWorkbenchHTML = workbenchHTML.replace(originalMetaTag, newMetaTag);

    // 9. Write the changes back to the file (currently commented out).
    // await fs.writeFile(filePath, newWorkbenchHTML, "utf-8");

    // TODO: Let Gemini run a one-off validation script.

    // DEBUG: Log the modified file content to verify correctness.
    console.log("--- Modified workbench.html Content Preview ---");
    console.log(newWorkbenchHTML);
    console.log("--- End of Preview ---");
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
        jsFileContent = jsFileContent.replace(
            /experimentalDarkMode/g,
            "visualEffectState:\"active\",experimentalDarkMode",
        );
    }

    const vibrancyType = "under-window"; // for macos

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

    console.log(vibrancyType);

    // TODO: 改动先输出到 file
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
