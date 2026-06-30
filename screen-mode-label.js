"use strict";

// Walford V6 Screen Mode Label

(function () {
  function mode() {
    const hash = location.hash;

    if (
      hash === "#admin-dashboard" ||
      hash === "#match-scorers-admin" ||
      hash === "#results-editor-admin"
    ) {
      return { text: "Admin Mode", className: "admin-mode" };
    }

    if (hash === "#match-centre") {
      return { text: "Admin Login / Match Centre", className: "admin-login-mode" };
    }

    return { text: "Public Site View", className: "public-mode" };
  }

  function installCss() {
    if (WC.dom.el("screenModeLabelCss")) return;

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

  function insertLabel() {
    let label = WC.dom.el("screenModeLabel");

    if (!label) {
      label = document.createElement("div");
      label.id = "screenModeLabel";
      document.body.appendChild(label);
    }

    return label;
  }

  function render() {
    installCss();

    const label = insertLabel();
    const current = mode();

    label.className = "";
    label.classList.add(current.className);
    label.textContent = current.text;
  }

  WC.events.once(document, "DOMContentLoaded", () => {
    render();
    setInterval(render, 1000);
  });

  WC.events.on(window, "hashchange", render);
})();
