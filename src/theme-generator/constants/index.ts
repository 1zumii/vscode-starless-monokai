import type { ExtensionInfo } from "../types/index.ts";

export * from "./color.ts";

export const MonokaiPro: ExtensionInfo = {
    name: "theme-monokai-pro-vscode",
    publisher: "monokai",
    repoName: "monokai-pro-vscode",
    repoAuthor: "Monokai",
};

export const OneMonokai: ExtensionInfo = {
    name: "one-monokai",
    publisher: "azemoh",
    repoName: "vscode-one-monokai",
    repoAuthor: "azemoh",
};

export const TEMP_DIR_PATH = "dist/temp";

export const THEME_APPEND_CONFIG = {
    $schema: "vscode://schemas/color-theme",
    semanticHighlighting: true,
};
