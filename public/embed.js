/**
 * HopTrack Embeddable Beer Menu
 * Drop this on any brewery website to show their live tap list.
 *
 * Usage:
 *   <div id="hoptrack-menu" data-brewery="BREWERY_UUID"></div>
 *   <script src="https://hoptrack.beer/embed.js" async></script>
 *
 * Options (data attributes):
 *   data-brewery     — Required. Brewery UUID from HopTrack.
 *   data-theme       — "cream" (default) or "dark"
 *   data-accent      — Hex color without # (default: "D4A843")
 *   data-layout      — "full" (default) or "compact"
 *   data-show-rating — "true" (default) or "false"
 *   data-show-price  — "true" (default) or "false"
 *   data-show-glass  — "true" (default) or "false"
 *   data-show-style  — "true" (default) or "false"
 *   data-show-events — "true" (default) or "false"
 *   data-show-description — "false" (default) or "true"
 */
(function () {
  "use strict";

  var BASE = (function () {
    var scripts = document.querySelectorAll("script[src]");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (src.indexOf("embed.js") !== -1) {
        // Derive base URL from script src
        return src.replace(/\/embed\.js.*$/, "");
      }
    }
    // Fallback: assume same origin
    return window.location.origin;
  })();

  function init() {
    var containers = document.querySelectorAll(
      "#hoptrack-menu, .hoptrack-menu, [data-hoptrack-menu]"
    );

    for (var i = 0; i < containers.length; i++) {
      var el = containers[i];
      if (el.getAttribute("data-hoptrack-initialized")) continue;
      el.setAttribute("data-hoptrack-initialized", "true");

      var breweryId = el.getAttribute("data-brewery");
      if (!breweryId) {
        console.warn("[HopTrack] Missing data-brewery attribute");
        continue;
      }

      // Build query params from data attributes
      var params = [];
      var theme = el.getAttribute("data-theme");
      if (theme) params.push("theme=" + encodeURIComponent(theme));

      var accent = el.getAttribute("data-accent");
      if (accent) params.push("accent=" + encodeURIComponent(accent));

      var layout = el.getAttribute("data-layout");
      if (layout) params.push("layout=" + encodeURIComponent(layout));

      var attrs = [
        "show-rating", "show-price", "show-glass",
        "show-style", "show-events", "show-description"
      ];
      for (var j = 0; j < attrs.length; j++) {
        var val = el.getAttribute("data-" + attrs[j]);
        if (val !== null) {
          // Convert kebab-case to camelCase
          var camel = attrs[j].replace(/-([a-z])/g, function (_, c) {
            return c.toUpperCase();
          });
          params.push(camel + "=" + encodeURIComponent(val));
        }
      }

      var src = BASE + "/embed/" + breweryId + "/menu";
      if (params.length) src += "?" + params.join("&");

      // Create iframe
      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.style.width = "100%";
      iframe.style.border = "none";
      iframe.style.overflow = "hidden";
      iframe.style.minHeight = "200px";
      iframe.style.colorScheme = "normal";
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("title", "HopTrack Beer Menu");
      iframe.setAttribute("allow", "");
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      );

      // Store reference for height updates
      iframe.setAttribute("data-hoptrack-brewery", breweryId);

      el.appendChild(iframe);
    }
  }

  // Listen for height updates from embeds
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "hoptrack:resize") return;
    var height = event.data.height;
    if (typeof height !== "number" || height < 50) return;

    // Find the matching iframe
    var iframes = document.querySelectorAll("iframe[data-hoptrack-brewery]");
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      if (iframe.contentWindow === event.source) {
        iframe.style.height = height + "px";
        break;
      }
    }
  });

  // Init on DOMContentLoaded or immediately if already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
