import * as VSCode from "vscode";

export const Notification = {
    info: (msg: string) => {
        VSCode.window.showInformationMessage(msg);
    },
    warn: (msg: string) => {
        VSCode.window.showWarningMessage(msg);
    },
    error: (msg: string) => {
        VSCode.window.showErrorMessage(msg);
    },
};
