(() => {
    const vscodeVibrancyTTP = window.trustedTypes.createPolicy(
        // eslint-disable-next-line no-undef
        $Inject.trustType(),
        { createHTML: v => v },
    );

    document.getElementById("vscode-vibrancy-style")?.remove();
    const styleElement = document.createElement("div");
    styleElement.id = "vscode-vibrancy-style";
    styleElement.innerHTML = vscodeVibrancyTTP.createHTML(
        // eslint-disable-next-line no-undef
        $Inject.styleHTML(),
    );

    document.body.appendChild(styleElement);
})();
