/**
 * The following logic is mainly referenced from the macOS part of extension:
 * https://github.com/illixion/vscode-vibrancy-continued
 */

import path from "node:path";
import process from "node:process";
import fse from "fs-extra";
import * as VSCode from "vscode";
import { RegisterCommand } from "../extension-manifest.ts";
import { type ResourceFiles, applyVibrancy, revertVibrancy } from "./main.ts";
import { Logger } from "./logger.ts";

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

export async function activate(context: VSCode.ExtensionContext) {
    const resourceFiles = await getResourcePaths();

    const applyCommand = VSCode.commands.registerCommand(
        RegisterCommand.ApplyVibrancy.command,
        async () => {
            await revertVibrancy(resourceFiles);

            applyVibrancy(resourceFiles);
        },
    );
    const revertCommand = VSCode.commands.registerCommand(
        RegisterCommand.ApplyVibrancy.command,
        () => {
            revertVibrancy(resourceFiles);
        },
    );

    context.subscriptions.push(applyCommand, revertCommand);
}

export async function deactivate() { }
