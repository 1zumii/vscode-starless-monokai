import { ANSI_COLOR_CONTRAST_ORDER } from "./constants/index.ts";
import type { AnsiColor, Color } from "./types/index.ts";
import { brighter, capitalize, fade } from "./utils/index.ts";

export const generateWorkBenchColors = (
    ansiColor: Readonly<AnsiColor>,
    // themeConfig: Readonly<ThemeConfig>,
): Record<string, Color> => {
    const workbenchColors: Record<string, Color> = {};

    const setter = (key: string, value: Color): void => {
        workbenchColors[key] = value;
    };

    const configuratorList: ((set: typeof setter) => void)[] = [
        // editorBracketPairGuide
        (set) => {
            Array.from({ length: 6 }).fill(null).forEach((_, index) => {
                set(
                    `editorBracketPairGuide.background${index + 1}`,
                    fade(ansiColor[ANSI_COLOR_CONTRAST_ORDER[index]]),
                );
                set(
                    `editorBracketPairGuide.activeBackground${index + 1}`,
                    ansiColor[ANSI_COLOR_CONTRAST_ORDER[index]],
                );
            });
        },
        // terminal ansi color
        (set) => {
            Object.keys(ansiColor).forEach((colorKey) => {
                set(`terminal.ansi${capitalize(colorKey)}`, ansiColor[colorKey as keyof AnsiColor]);
                set(`terminal.ansiBright${capitalize(colorKey)}`, brighter(ansiColor[colorKey as keyof AnsiColor]));
            });
        },
        // cursor
        (set) => {
            set("editorCursor.foreground", ansiColor.cyan);
            set("editorCursor.background", ansiColor.black);
        },
        // editorLineNumber
        (set) => {
            const cursorColor = workbenchColors["editorCursor.foreground"];
            set("editorLineNumber.activeForeground", cursorColor);
            set("editor.lineHighlightBackground", fade(cursorColor, "1f"));
        },
        // bracket pair colorization
        (set) => {
            Array.from({ length: 6 }).fill(null).forEach((_, index) => {
                set(`editorBracketHighlight.foreground${index + 1}`, ansiColor[ANSI_COLOR_CONTRAST_ORDER[index]]);
                // background not work
                /* set(
                    'editorBracketHighlight.unexpectedBracket.foreground',
                    ansiColor.black,
                );
                set(
                    'editorBracketHighlight.unexpectedBracket.background',
                    ansiColor.red,
                ); */
            });
        },
        // Lightbulb
        (set) => {
            set("editorLightBulb.foreground", ansiColor.magenta);
            set("editorLightBulbAutoFix.foreground", ansiColor.cyan);
        },
        // Text colors
        (set) => {
            set("textLink.activeForeground", ansiColor.cyan);
            set("textLink.foreground", ansiColor.blue);
        },
        // Git colors
        (set) => {
            set("gitDecoration.modifiedResourceForeground", ansiColor.yellow);
            set("gitDecoration.untrackedResourceForeground", ansiColor.green);
            set("gitDecoration.conflictingResourceForeground", ansiColor.red);
            set("gitDecoration.deletedResourceForeground", ansiColor.magenta);
            set("gitDecoration.renamedResourceForeground", ansiColor.cyan);

            set("gitDecoration.stageModifiedResourceForeground", brighter(ansiColor.yellow));
            set("gitDecoration.stageDeletedResourceForeground", brighter(ansiColor.magenta));

            // error file color controlled by `list.errorForeground`
        },
        // Editor colors
        (set) => {
            set("editorError.foreground", ansiColor.red);
            set("editorWarning.foreground", ansiColor.yellow);
            set("editorInfo.foreground", ansiColor.magenta);
            set("editorHint.foreground", ansiColor.cyan);
        },
        // Lists and trees
        (set) => {
            set("list.errorForeground", ansiColor.red);
            set("list.warningForeground", brighter(ansiColor.yellow));
        },
    ];

    configuratorList.forEach(configuratorList => configuratorList(setter));

    return workbenchColors;
};
