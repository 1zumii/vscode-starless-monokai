import type { LegacyThemeConfig, ThemeConfig } from "../types/index.ts";

export const isLegacyThemeConfig = (
    themeConfigLike: Record<string, any>,
): themeConfigLike is LegacyThemeConfig => {
    return Array.isArray(themeConfigLike.tokenColors) && themeConfigLike.tokenColors.some((token) => {
        return !token.name && token.settings.name;
    });
};

export const transformLegacyThemeConfig = (
    config: LegacyThemeConfig,
): ThemeConfig => {
    const legacyTokenColors = config.tokenColors;
    return {
        ...config,
        tokenColors: legacyTokenColors.map((token) => {
            const name = token.settings.name ?? token.settings.Name;
            delete token.settings.name;
            delete token.settings.Name;
            return {
                ...token,
                name,
            };
        }),
    };
};
