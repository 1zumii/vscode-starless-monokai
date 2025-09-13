(() => {
    // #INJECTION_START
    const $Inject = {};
    // #INJECTION_END

    const vscodeVibrancyTTP = window.trustedTypes.createPolicy(
        $Inject.trustType(),
        { createHTML: v => v },
    );

    document.getElementById("vscode-vibrancy-style")?.remove();
    const styleElement = document.createElement("div");
    styleElement.id = "vscode-vibrancy-style";
    styleElement.innerHTML = vscodeVibrancyTTP.createHTML(
        $Inject.styleHTML(),
    );

    document.body.appendChild(styleElement);
})();
