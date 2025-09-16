import process from "node:process";
import os from "node:os";
import * as VSCode from "vscode";

export const Platform = {
    MAC: "mac",
    WIN10: "win10",
    WIN11: "win11",
    UNKNOWN: "unknown",
} as const;

export function getPlatformType(): typeof Platform[keyof typeof Platform] {
    const platform = process.platform;

    if (platform === "darwin") {
        return Platform.MAC;
    }

    if (platform === "win32") {
        const release = os.release();
        const buildNumber = Number.parseInt(release.split(".")[2] || "0");

        // Windows 11 build number >= 22000
        if (buildNumber >= 22000) {
            return Platform.WIN11;
        }
        else {
            return Platform.WIN10;
        }
    }

    return Platform.UNKNOWN;
}

export const App = {
    VS_CODE: "vs-code",
    CURSOR: "cursor",
    UNKNOWN: "unknown",
} as const;

export function getAppType(): typeof App[keyof typeof App] {
    const current = VSCode.env.appName;

    if (["Visual Studio Code", "Visual Studio Code - Insiders"].includes(current)) {
        return App.VS_CODE;
    }
    else if (current === "Cursor") {
        return App.CURSOR;
    }
    else {
        return App.UNKNOWN;
    }
}
