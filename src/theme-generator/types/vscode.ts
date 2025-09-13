import type { Color } from "./theme.ts";

/**
 * more references
 * https://github.com/microsoft/vscode/blob/main/src/vs/workbench/common/theme.ts
 * https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/colorThemeSchema.ts
 * https://github.com/microsoft/vscode/blob/main/src/vs/platform/theme/common/colorRegistry.ts
 */

// Copy from: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/workbenchThemeService.ts
export type TokenColorizationSetting = {
    foreground?: Color; // in vscode, is string
    background?: Color; // in vscode, is string
    fontStyle?: string; /* [italic|bold|underline|strikethrough] */
};

// Copy from: https://github.com/microsoft/vscode/blob/main/src/vs/workbench/services/themes/common/workbenchThemeService.ts
export type TextMateThemingRule = {
    name?: string;
    scope?: string | string[];
    settings: TokenColorizationSetting;
};
