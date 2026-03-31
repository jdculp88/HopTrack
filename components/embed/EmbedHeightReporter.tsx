"use client";

import { useEffect } from "react";

export function EmbedHeightReporter() {
  useEffect(() => {
    function reportHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "hoptrack:resize", height }, "*");
    }

    // Report initial height
    reportHeight();

    // Report on resize
    const observer = new ResizeObserver(reportHeight);
    observer.observe(document.body);

    // Report on image load (glass SVGs, etc.)
    window.addEventListener("load", reportHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", reportHeight);
    };
  }, []);

  return null;
}
