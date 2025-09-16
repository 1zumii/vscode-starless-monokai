(() => {
    try {
        // eslint-disable-next-line no-undef
        electron.app.on("browser-window-created", (_, window) => {
            // eslint-disable-next-line no-undef
            const type = $Inject.vibrancyType();

            // window.on("closed", () => {
            //     effects.uninstall();
            // });

            window.webContents.on("dom-ready", () => {
                const currentURL = window.webContents.getURL();

                if (!currentURL.includes("workbench.html")) {
                    return;
                }

                window.setBackgroundColor("#00000000");

                // effects.install();

                // eslint-disable-next-line no-undef
                if ($Inject.isMacOS()) {
                    window.setVibrancy(type);

                    // hack
                    const width = window.getBounds().width;
                    window.setBounds({
                        width: width + 1,
                    });
                    window.setBounds({
                        width,
                    });
                }

                // inject style element
                window.webContents.executeJavaScript(
                    // eslint-disable-next-line no-undef
                    $Inject.styleInject(),
                );
            });
        });
    }
    catch (err) {
        console.error(err);
    }
})();
