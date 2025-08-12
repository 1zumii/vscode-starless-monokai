import type { OverrideProperties } from "type-fest";
import type { TextMateThemingRule, TokenColorizationSetting } from "./vscode.ts";

export type Hex = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";

export type Color = `#${string}`;

export type ThemeConfig = {
    name: string;
    type: string;
    colorSpaceName?: string;
    colors: Record<string, Color>;
    tokenColors: TextMateThemingRule[];
    [prop: string]: unknown;
};

export type LegacyThemeConfig = OverrideProperties<
    ThemeConfig,
    {
        tokenColors: (Pick<TextMateThemingRule, "scope"> & {
            settings: TokenColorizationSetting & {
                name?: string;
                Name?: string;
            };
        })[];
    }
>;

export type AnsiColor = {
    black: Color; // #292C36
    red: Color; // #DC3C3C
    green: Color; // #95C76F
    yellow: Color; // #D28E5D
    blue: Color; // #8485CE
    magenta: Color; // #B73999
    cyan: Color; // #00ABA5
    white: Color; // #A8ABB6
};
