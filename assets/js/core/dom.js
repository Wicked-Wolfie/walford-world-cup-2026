"use strict";

window.WC = window.WC || {};

window.WC.dom = {
  el(id) {
    return document.getElementById(id);
  },

  q(selector, root = document) {
    return root.querySelector(selector);
  },

  qa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  },

  show(id) {
    const node = this.el(id);
    if (node) node.classList.remove("hidden");
  },

  hide(id) {
    const node = this.el(id);
    if (node) node.classList.add("hidden");
  },

  setText(id, value) {
    const node = this.el(id);
    if (node) node.textContent = value ?? "";
  },

  setHtml(id, value) {
    const node = this.el(id);
    if (node) node.innerHTML = value ?? "";
  },

  esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};
