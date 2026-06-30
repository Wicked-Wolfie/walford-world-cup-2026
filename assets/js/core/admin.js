"use strict";

window.WC = window.WC || {};

WC.admin = {
  session: null,

  setSession(session) {
    this.session = session || null;
    WC.events.emit("wc:admin-session-changed", {
      signedIn: !!this.session,
      session: this.session
    });
  },

  isSignedIn() {
    return !!this.session;
  },

  showOnlyWhenSignedIn(element) {
    if (!element) return;
    element.classList.toggle("hidden", !this.isSignedIn());
  }
};
