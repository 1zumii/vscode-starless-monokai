import { MONOKAI_PRO_YELLOW, MonokaiPro, ONE_DARK_BLUE, OneMonokai } from "./constants/index.ts";
import type { MonokaiGenerateResult } from "./monokai-generator.ts";
import { createMonokaiGenerator } from "./monokai-generator.ts";
import { setFetchProxy } from "./utils/index.ts";
import { Logger } from "./utils/log.ts";

export const generateTheme = async (throwProxy = true): Promise<MonokaiGenerateResult[]> => {
    if (throwProxy) {
        // NOTE: if necessary
        setFetchProxy("http://127.0.0.1:7890");
    }

    try {
        const themeGenerateResults = await Promise.all([
            createMonokaiGenerator({
                themeName: ["starless", "monokai", "pro"],
                sourceExtension: MonokaiPro,
                findThemeConfigInPackage: filePath => filePath === "extension/themes/Monokai Pro.json",
                presetAnsiColors: {
                    black: "#403e41",
                    blue: ONE_DARK_BLUE,
                    cyan: "#78dce8",
                    green: "#a9dc76",
                    magenta: "#ab9df2",
                    red: "#ff6188",
                    white: "#d7dae0",
                    yellow: "#fc9867",
                },
                preprocessThemeConfig: (config) => {
                    config.tokenColors.forEach((token) => {
                        if (token.settings.foreground === MONOKAI_PRO_YELLOW)
                            token.settings.foreground = ONE_DARK_BLUE;
                    });
                    return config;
                },
            }),
            createMonokaiGenerator({
                themeName: ["starless", "monokai", "atom"],
                // same as monokai-pro
                sourceExtension: MonokaiPro,
                findThemeConfigInPackage: filePath => filePath === "extension/themes/Monokai Pro.json",
                presetAnsiColors: {
                    black: "#403e41",
                    blue: ONE_DARK_BLUE,
                    cyan: "#78dce8",
                    green: "#a9dc76",
                    magenta: "#ab9df2",
                    red: "#ff6188",
                    white: "#d7dae0",
                    yellow: "#fc9867",
                },
                // different from monokai-pro, swap the colors of Function and String
                preprocessThemeConfig: (config) => {
                    const monokaiProGreen = config.tokenColors.find((token) => {
                        if (Array.isArray(token.scope))
                            return token.scope.includes("entity.name.function");
                        else
                            return token.scope === "entity.name.function";
                    })?.settings.foreground;

                    if (!monokaiProGreen) {
                        // TODO: error log
                        return config;
                    }

                    config.tokenColors.forEach((token) => {
                        // set String to green
                        if (token.settings.foreground === MONOKAI_PRO_YELLOW)
                            token.settings.foreground = monokaiProGreen;
                        // set Function to blue
                        else if (token.settings.foreground === monokaiProGreen)
                            token.settings.foreground = ONE_DARK_BLUE;
                    });

                    return config;
                },
            }),
            createMonokaiGenerator({
                themeName: ["starless", "monokai", "one"],
                sourceExtension: OneMonokai,
                findThemeConfigInPackage: filePath => filePath === "extension/themes/OneMonokai-color-theme.json",
                presetAnsiColors: {
                    black: "#2d3139",
                    blue: "#61afef",
                    green: "#98c379",
                    yellow: "#e5c07b",
                    cyan: "#56b6c2",
                    magenta: "#c678dd",
                    red: "#e06c75",
                    white: "#abb2bf",
                },
            }),
        ].map(generator => generator.run()));

        const themes = themeGenerateResults.filter(
            (theme): theme is MonokaiGenerateResult => !!theme,
        );

        return themes;
    }
    catch (error) {
        Logger.error(error);

        return [];
    }
};
