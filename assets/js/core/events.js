"use strict";

window.WC = window.WC || {};

WC.events = {

  on(target, event, handler, options) {
    if (!target) return;
    target.addEventListener(event, handler, options || false);
  },

  off(target, event, handler, options) {
    if (!target) return;
    target.removeEventListener(event, handler, options || false);
  },

  once(target, event, handler) {
    if (!target) return;
    target.addEventListener(event, handler, { once: true });
  },

  emit(name, detail) {
    document.dispatchEvent(
      new CustomEvent(name, {
        detail: detail || {}
      })
    );
  },

  listen(name, handler) {
    document.addEventListener(name, handler);
  }

};
