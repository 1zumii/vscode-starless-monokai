import type { AnsiColor, ThemeConfig } from "./theme.ts";

export * from "./vscode.ts";
export * from "./theme.ts";

export type Version = [major: number, minor: number, patch: number];

export type ExtensionInfo = {
    name: string;
    publisher: string;
    repoName: string;
    repoAuthor: string;
};

export type GeneratorConfig = {
    themeName: Lowercase<string>[];
    sourceExtension: ExtensionInfo;
    findThemeConfigInPackage: (filePath: string) => boolean;
    preprocessThemeConfig?: (config: ThemeConfig) => ThemeConfig;
    /** match tokenColors with preset as much as possible */
    presetAnsiColors: AnsiColor;
};
