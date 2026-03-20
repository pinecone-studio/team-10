"use client";

import { useEffect } from "react";

function setBusyAttribute(isBusy: boolean) {
  if (typeof document === "undefined") return;
  if (isBusy) {
    document.documentElement.setAttribute("data-backend-busy", "true");
    return;
  }
  document.documentElement.removeAttribute("data-backend-busy");
}

export function GlobalBusyOverlay() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let activeRequests = 0;
    const originalFetch = window.fetch.bind(window);
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    const syncState = () => setBusyAttribute(activeRequests > 0);
    const begin = () => {
      activeRequests += 1;
      syncState();
    };
    const end = () => {
      activeRequests = Math.max(0, activeRequests - 1);
      syncState();
    };

    window.fetch = async (...args) => {
      begin();
      try {
        return await originalFetch(...args);
      } finally {
        end();
      }
    };

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      this.addEventListener("loadend", end, { once: true });
      return originalOpen.call(this, method, url, async ?? true, username, password);
    };

    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      begin();
      try {
        return originalSend.call(this, body);
      } catch (error) {
        end();
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
      setBusyAttribute(false);
    };
  }, []);

  return (
    <div className="global-loading-overlay" aria-hidden="true">
      <div className="hourglassBackground">
        <div className="hourglassContainer">
          <div className="hourglassCurves" />
          <div className="hourglassCapTop" />
          <div className="hourglassGlassTop" />
          <div className="hourglassSand" />
          <div className="hourglassSandStream" />
          <div className="hourglassCapBottom" />
          <div className="hourglassGlass" />
        </div>
      </div>
    </div>
  );
}
