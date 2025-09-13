/**
 * The following logic is mainly referenced from the macOS part of extension:
 * https://github.com/illixion/vscode-vibrancy-continued
 */

import path from "node:path";
import process from "node:process";
import fse from "fs-extra";
import * as VSCode from "vscode";
import { RegisterCommand } from "../extension-manifest.ts";
import { Logger } from "./utils/logger.ts";
import { installWorkbenchHTML, uninstallWorkbenchHTML } from "./patch-workbench-html";
import { installRuntimePatch, uninstallRuntimePatch } from "./patch-runtime";

type ResourceFiles = {
    appDir: string;
    appMain: string;
    workbenchHTML: string;
};

async function getResourcePaths(): Promise<ResourceFiles> {
    try {
        // locate app path
        // such as: `/Applications/Visual Studio Code.app/Contents/Resources/app/out`
        const appDir = path.dirname(process.argv[1]);

        if (appDir.includes(".vscode-server")) {
            throw new Error("Vibrancy effect cannot run at server side");
        }

        const appMain = path.resolve(appDir, "main.js");

        // after v1.95, there is no `/vs/code/electron-main/main.js`

        let workbenchHTML: string | undefined;
        const workbenchHTMLPathLegacy = path.resolve(appDir, "vs/code/electron-sandbox/workbench/workbench.html");
        const workbenchHTMLPath = path.resolve(appDir, "vs/code/electron-browser/workbench/workbench.html");
        if (fse.existsSync(workbenchHTMLPath)) {
            workbenchHTML = workbenchHTMLPath;
        }
        else if (fse.existsSync(workbenchHTMLPathLegacy)) {
            workbenchHTML = workbenchHTMLPathLegacy;
        }

        if (!workbenchHTML) {
            throw new Error("Can't find workbench html");
        }

        return {
            appDir,
            appMain,
            workbenchHTML,
        };
    }
    catch (err) {
        Logger.error(`Resolve app resources failed${err ? `: ${err}` : ""}`);
        throw err;
    }
}

async function revertVibrancy(
    resourceFiles: ResourceFiles,
    config: { silent?: boolean } = { silent: false },
): Promise<void> {
    await uninstallWorkbenchHTML(resourceFiles.workbenchHTML, config?.silent);

    await uninstallRuntimePatch(resourceFiles.appMain, config?.silent);
}

async function applyVibrancy(resourceFiles: ResourceFiles): Promise<void> {
    await installWorkbenchHTML(resourceFiles.workbenchHTML);

    await installRuntimePatch(resourceFiles.appMain);
}

export async function activate(context: VSCode.ExtensionContext) {
    const resourceFiles = await getResourcePaths();

    const applyCommand = VSCode.commands.registerCommand(
        RegisterCommand.ApplyVibrancy.command,
        async () => {
            try {
                await revertVibrancy(resourceFiles, { silent: true });

                await applyVibrancy(resourceFiles);

                // TODO: prompt: restart to take effect

                // TODO: apply new check sum
            }
            catch (err) {
                Logger.error(err as any);
            }
        },
    );
    const revertCommand = VSCode.commands.registerCommand(
        RegisterCommand.RevertVibrancy.command,
        async () => {
            try {
                await revertVibrancy(resourceFiles);

                // TODO: prompt: restart to take effect

                // TODO: revert check sum
            }
            catch (err) {
                Logger.error(err as any);
            }
        },
    );

    context.subscriptions.push(applyCommand, revertCommand);
}

export async function deactivate() { }
