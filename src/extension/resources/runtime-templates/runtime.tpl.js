;(() => {
    // #INJECTION_START
    const $Inject = {};
    const electron = {}; // bypass a `no-undef` error from ESLint
    // #INJECTION_END

    // TODO: ensure this function run
    // const Logger = (() => {
    //     const suppress = false;

    //     return {
    //         info: () => {
    //             if (suppress) {
    //                 return;
    //             }

    //             console.log();
    //         },
    //     };
    // })();

    /**
     * NOTE: 要不试试 APC 的实现方式？
     * 实现 vibrancy 看起来更简单
     * https://github.com/subframe7536/vscode-custom-ui-style
     * https://github.com/subframe7536/vscode-custom-ui-style/issues/27
     * https://github.com/drcika/apc-extension/blob/production/demo/vibrancy.settings.json
     */

    /**
     * TODO:
     * 0. 有个 runtime-log 往文件写日志
     *   - 能不能加个条件判断能不能执行
     *
     * 2. 可能是要 install effect
     * 3. gemini 分析下 apc 是怎么实现的
     */

    try {
        electron.app.on("browser-window-created", (_, window) => {
            const type = $Inject.vibrancyType();

            // window.on("closed", () => {
            //     effects.uninstall();
            // });

            window.webContents.on("dom-ready", () => {
                const currentURL = window.webContents.getURL();

                if (!currentURL.includes("workbench.html")) {
                    return;
                }

                // TODO: 这里开始有没有执行

                window.setBackgroundColor("#00000000");

                // effects.install();

                if ($Inject.isMacOS()) {
                    window.setVibrancy(type);

                    // HACK: Force redraw to work around historical vibrancy rendering bugs (may now be obsolete).
                    // const width = window.getBounds().width;
                    // window.setBounds({ width: width + 1 });
                    // window.setBounds({ width });
                }

                // inject style element
                window.webContents.executeJavaScript(
                    $Inject.styleInject(),
                );
            });
        });
    }
    catch (err) {
        console.error(err);
    }
})();
