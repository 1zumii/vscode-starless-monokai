import fs from "node:fs/promises";
import { Notification } from "./utils/output";
import { App, Platform, getAppType, getPlatformType } from "./utils/env";
import { type InjectionData, generateInjectString, replaceInjectionBlock } from "./utils/template";
import { INJECT_TRUST_TYPE } from "./constants";
import { getResourcePath } from "./resources";

/**
 * add visualEffectState option to enable vibrancy while VSCode is not in focus (macOS only)
 *
 * https://github.com/illixion/vscode-vibrancy-continued/issues/36
 * vibrancy-continued v1.1.19, v1.1.20
 */
function applyVisualEffectStatePatch(fileContent: Readonly<string>): string {
    if (fileContent.includes("visualEffectState")) {
        return fileContent;
    }

    return fileContent.replace(
        /experimentalDarkMode/g,
        "visualEffectState:\"active\",experimentalDarkMode",
    );
}

function revertVisualEffectStatePatch(fileContent: Readonly<string>): string {
    if (!fileContent.includes("visualEffectState")) {
        return fileContent;
    }

    return fileContent.replace(
        /visualEffectState:"active",experimentalDarkMode/g,
        "experimentalDarkMode",
    ); ;
};

/**
 * generate inject variables for `style-inject.tpl.js`
 */
async function generateStyleInjection(): Promise<InjectionData> {
    const injectVariables: InjectionData = {};

    injectVariables.trustType = INJECT_TRUST_TYPE;

    const editorApp = getAppType();

    const themeFilenames = ["main.css"];
    if (editorApp === App.CURSOR) {
        themeFilenames.push("cursor.css");
    }

    const themeContents = await Promise.all(
        themeFilenames.map(fileName =>
            fs.readFile(getResourcePath("patch-themes", fileName), "utf-8"),
        ),
    );

    const patchStyle = themeContents.join("\n\n");

    injectVariables.styleHTML = `<style>${patchStyle}</style>`;

    return injectVariables;
}

/**
 * generate inject variables for `runtime.tpl.js`
 */
async function generateRuntimeInjection(): Promise<InjectionData> {
    const injectVariables: InjectionData = {};

    const vibrancyType = "under-window"; // for macos
    injectVariables.vibrancyType = vibrancyType;

    const platform = getPlatformType();
    injectVariables.isMacOS = platform === Platform.MAC;

    return injectVariables;
}

async function generateRuntimeScript(): Promise<string> {
    /*
     * not support windows yet, `win.setBackgroundMaterial` requires:
     * - Windows 11 22H2+
     * - Electron 34+
     *
     * If:
     *  enable frameless window on Windows w/ Electron 27 (bug #122)
     */

    // 1. inject styles
    const styleInjectVariables = await generateStyleInjection();

    const styleInjectTemplatePath = getResourcePath("runtime-templates", "style-inject.tpl.js");
    const styleInjectTemplate = await fs.readFile(styleInjectTemplatePath, { encoding: "utf-8" });

    const styleInjectResult = replaceInjectionBlock(
        styleInjectTemplate,
        generateInjectString(styleInjectVariables),
    );

    // 2. inject runtime
    const runtimeInjectVariables = await generateRuntimeInjection();
    runtimeInjectVariables.styleInject = styleInjectResult;

    const runtimeInjectTemplatePath = getResourcePath("runtime-templates", "runtime.tpl.js");
    const runtimeInjectTemplate = await fs.readFile(runtimeInjectTemplatePath, { encoding: "utf-8" });

    const runtimeInjectResult = replaceInjectionBlock(
        runtimeInjectTemplate,
        generateInjectString(runtimeInjectVariables),
    );

    // 3. return result
    return runtimeInjectResult;
}

/**
 * Patch `out/main.js`:
 * - add visualEffectState
 * - Injects the runtime script for vibrancy and other effects
 */
export async function installRuntimePatch(filePath: string) {
    let jsFileContent = await fs.readFile(filePath, { encoding: "utf-8" });

    const blockRegex = /\/\/ --- STARLESS-MONOKAI-RUNTIME-START ---[\s\S]*?\/\/ --- STARLESS-MONOKAI-RUNTIME-END ---/;
    if (blockRegex.test(jsFileContent)) {
        Notification.info("Runtime patch is already installed. Skipping.");
        return;
    }

    jsFileContent = applyVisualEffectStatePatch(jsFileContent);

    const runtimeScript = await generateRuntimeScript();
    jsFileContent = [
        jsFileContent,
        "\n\n",
        "// --- STARLESS-MONOKAI-RUNTIME-START ---",
        "\n",
        runtimeScript,
        "// --- STARLESS-MONOKAI-RUNTIME-END ---",
        "\n",
    ].join("");

    await fs.writeFile(filePath, jsFileContent, "utf-8");
}

export async function uninstallRuntimePatch(
    filePath: string,
    silent: boolean = false,
) {
    let jsFileContent = await fs.readFile(filePath, { encoding: "utf-8" });

    const blockRegex = /\n\n\/\/ --- STARLESS-MONOKAI-RUNTIME-START ---[\s\S]*?\/\/ --- STARLESS-MONOKAI-RUNTIME-END ---/g;
    if (!blockRegex.test(jsFileContent)) {
        if (!silent) {
            Notification.warn("Runtime patch not found. Skipping uninstallation.");
        }
        return;
    }

    jsFileContent = jsFileContent.replace(blockRegex, "");
    jsFileContent = revertVisualEffectStatePatch(jsFileContent);

    await fs.writeFile(filePath, jsFileContent, "utf-8");
}
