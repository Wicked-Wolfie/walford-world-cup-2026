// Walford Screen Mode Label
// Shows whether you are looking at Public Site, Admin Login, or Admin Mode.

(function () {
  function smlInsert() {
    let label = document.getElementById("screenModeLabel");

    if (!label) {
      label = document.createElement("div");
      label.id = "screenModeLabel";
      document.body.appendChild(label);
    }

    return label;
  }

  function smlInstallCss() {
    if (document.getElementById("screenModeLabelCss")) return;

    const style = document.createElement("style");
    style.id = "screenModeLabelCss";
    style.textContent = `
      #screenModeLabel {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 99999;
        padding: 10px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.18);
      }

      #screenModeLabel.public-mode {
        background: rgba(23, 45, 70, 0.95);
        color: #ffffff;
      }

      #screenModeLabel.admin-login-mode {
        background: rgba(245, 197, 66, 0.95);
        color: #09111f;
      }

      #screenModeLabel.admin-mode {
        background: rgba(20, 120, 75, 0.95);
        color: #ffffff;
      }
    `;

    document.head.appendChild(style);
  }

  function smlMode() {
    if (
      location.hash === "#admin-dashboard" ||
      location.hash === "#match-scorers-admin" ||
      location.hash === "#results-editor-admin"
    ) {
      return {
        text: "Admin Mode",
        className: "admin-mode"
      };
    }

    if (location.hash === "#match-centre") {
      return {
        text: "Admin Login / Match Centre",
        className: "admin-login-mode"
      };
    }

    return {
      text: "Public Site View",
      className: "public-mode"
    };
  }

  function smlRender() {
    smlInstallCss();

    const label = smlInsert();
    const mode = smlMode();

    label.className = "";
    label.classList.add(mode.className);
    label.textContent = mode.text;
  }

  document.addEventListener("DOMContentLoaded", () => {
    smlRender();
    setInterval(smlRender, 1000);
  });

  window.addEventListener("hashchange", smlRender);
})();
