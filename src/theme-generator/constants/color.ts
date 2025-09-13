import type { AnsiColor, Color } from "../types/index.ts";

export const WWDC_ANSI_COLORS: AnsiColor = {
    black: "#292C36",
    red: "#DC3C3C",
    green: "#95C76F",
    yellow: "#D28E5D",
    blue: "#8485CE",
    magenta: "#B73999",
    cyan: "#00ABA5",
    white: "#A8ABB6",
};

export const ONE_DARK_BLUE: Color = "#61afef";

export const MONOKAI_PRO_YELLOW: Color = "#ffd866";

export const ANSI_COLOR_CONTRAST_ORDER: (keyof AnsiColor)[] = ["blue", "red", "green", "magenta", "cyan", "yellow"];
