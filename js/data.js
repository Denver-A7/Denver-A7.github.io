// Data-driven motion for the project figures: hero bars, odometer counters,
// scanline reveal. Targets come from data attributes; the HTML already holds the
// final numbers, so nothing here changes what is shown without JavaScript.
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var toArray = function (list) {
    return Array.prototype.slice.call(list);
  };
  var easeOut = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  /* ---------- Visibility helper (bounding-rect based; see main.js) ---------- */

  var watchers = [];

  function whenVisible(el, callback) {
    watchers.push({ el: el, cb: callback });
  }

  function checkWatchers() {
    if (!watchers.length) return;
    var limit = window.innerHeight * 0.9;
    watchers = watchers.filter(function (w) {
      var rect = w.el.getBoundingClientRect();
      if (rect.top < limit && rect.bottom > 0) {
        w.cb();
        return false;
      }
      return true;
    });
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      checkWatchers();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", checkWatchers);

  /* ---------- Hero bars: grow from 0 to --v on load ---------- */

  var bars = toArray(document.querySelectorAll(".chart__bar[data-value]"));
  bars.forEach(function (bar, i) {
    bar.classList.add("is-armed");
    bar.style.transitionDelay = 200 + i * 120 + "ms";
  });
  // Two frames so the armed (scaleX(0)) state is painted before the transition starts
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      bars.forEach(function (bar) {
        bar.classList.add("is-grown");
      });
    });
  });

  /* ---------- Odometers ---------- */

  function buildOdometer(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target) || target < 0) return null;
    var text = String(target);

    var odo = document.createElement("span");
    odo.className = "odo";
    odo.setAttribute("aria-hidden", "true");

    var cols = text.split("").map(function () {
      var digit = document.createElement("span");
      digit.className = "odo__digit";
      var col = document.createElement("span");
      col.className = "odo__col";
      for (var n = 0; n <= 10; n++) {
        var cell = document.createElement("span");
        cell.textContent = String(n % 10);
        col.appendChild(cell);
      }
      digit.appendChild(col);
      odo.appendChild(digit);
      return col;
    });

    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = text;

    el.textContent = "";
    el.appendChild(odo);
    el.appendChild(sr);

    var state = { cols: cols, places: text.length, target: target, started: false };
    setOdometer(state, 0);
    return state;
  }

  // Each wheel rolls continuously; higher wheels turn only as the one below passes 9.
  function setOdometer(state, value) {
    for (var i = 0; i < state.places; i++) {
      var place = Math.pow(10, state.places - 1 - i);
      var digit = Math.floor(value / place) % 10;
      var below = (value % place) / place;
      var carry = i === state.places - 1 ? value % 1 : below > 0.9 ? (below - 0.9) * 10 : 0;
      state.cols[i].style.transform = "translateY(" + (-(digit + carry)).toFixed(3) + "em)";
    }
  }

  function runOdometer(state, duration, delay) {
    if (!state || state.started) return;
    state.started = true;
    var start = null;
    function frame(now) {
      if (start === null) start = now + delay;
      var t = Math.min(1, Math.max(0, (now - start) / duration));
      setOdometer(state, easeOut(t) * state.target);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setOdometer(state, state.target);
      }
    }
    requestAnimationFrame(frame);
  }

  toArray(document.querySelectorAll("[data-count]")).forEach(function (el) {
    var state = buildOdometer(el);
    if (!state) return;
    if (el.closest(".readout")) {
      runOdometer(state, 1400, 250);
    } else {
      whenVisible(el, function () {
        runOdometer(state, 1400, 150);
      });
    }
  });

  /* ---------- Scanline reveal ---------- */

  toArray(document.querySelectorAll("[data-scan]")).forEach(function (el) {
    whenVisible(el, function () {
      el.classList.add("is-scanned");
    });
  });

  checkWatchers();
})();
