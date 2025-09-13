import { generateTheme } from "./theme-generator/index.ts";
import { outputExtension } from "./output-extension.ts";

(async () => {
    const themes = await generateTheme();

    outputExtension(themes);
})();
