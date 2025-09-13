import type { AnsiColor, TextMateThemingRule, ThemeConfig } from "./types/index.ts";

const COLOR_GREY = "#939293";

export const generateMarkdownSyntaxHighlighting = (
    _themeConfig: Readonly<ThemeConfig>,
    presetAnsiColors: Readonly<AnsiColor>,
): TextMateThemingRule[] => {
    return [
        {
            scope: "markup.underline.link",
            settings: {
                foreground: COLOR_GREY,
                fontStyle: "italic",
            },
        },
        {
            scope: [
                "punctuation.definition.list.begin.markdown",
                "punctuation.definition.list.begin.markdown",
            ],
            settings: {
                foreground: presetAnsiColors.blue,
            },
        },
        {
            scope: [
                "markup.inline.raw.string.markdown",
            ],
            settings: {
                foreground: presetAnsiColors.yellow,
            },
        },
        {
            scope: "markup.bold.markdown",
            settings: {
                foreground: presetAnsiColors.magenta,
            },
        },
        {
            scope: [
                "string.other.link.description",
                "string.other.link.title.markdown",
            ],
            settings: {
                foreground: presetAnsiColors.cyan,
            },
        },
        {
            scope: "markup.quote",
            settings: {
                foreground: COLOR_GREY,
                fontStyle: "italic",
            },
        },
        {
            scope: "markup.raw",
            settings: {
                foreground: presetAnsiColors.red,
            },
        },
    ];
};
