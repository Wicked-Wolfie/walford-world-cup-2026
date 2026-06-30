"use strict";

window.WC = window.WC || {};

window.WC.supabase = {
  client: null,

  getClient() {
    if (this.client) return this.client;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) {
      console.warn("WC Supabase client not available");
      return null;
    }

    this.client = window.supabase.createClient(url, key);
    return this.client;
  }
};
