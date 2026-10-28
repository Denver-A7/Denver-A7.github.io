// Nav behaviour, theme toggle, scroll reveals, level gauge, section counters.
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktopQuery = window.matchMedia("(min-width: 901px)");

  /* ---------- 1. Theme ---------- */

  var THEME_KEY = "theme";
  var themeBtn = document.querySelector(".theme-toggle");

  function readSavedTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    var isLight = theme === "light";
    if (themeBtn) {
      themeBtn.setAttribute("aria-checked", String(isLight));
    }
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        /* storage unavailable (private mode, quota); theme still applies for this page */
      }
    }
  }

  // Saved choice wins; otherwise dark (a pre-set data-theme="light" on <html> is honoured for previews)
  applyTheme(readSavedTheme() || (root.getAttribute("data-theme") === "light" ? "light" : "dark"), false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
    });
  }

  /* ---------- 2. Active nav link + sliding underline ---------- */

  var nav = document.querySelector(".nav");
  var linkList = document.getElementById("nav-links");
  var links = linkList ? Array.prototype.slice.call(linkList.querySelectorAll(".nav__link")) : [];
  var indicator = null;
  var activeLink = null;

  if (linkList && links.length) {
    indicator = document.createElement("span");
    indicator.className = "nav__indicator";
    indicator.setAttribute("aria-hidden", "true");
    linkList.appendChild(indicator);
    linkList.classList.add("has-indicator");
  }

  function positionIndicator() {
    if (!indicator) return;
    if (!activeLink || !desktopQuery.matches) {
      indicator.classList.remove("is-visible");
      return;
    }
    indicator.style.transform =
      "translateX(" + activeLink.offsetLeft + "px) scaleX(" + activeLink.offsetWidth + ")";
    indicator.classList.add("is-visible");
  }

  function setActive(id) {
    var next = null;
    links.forEach(function (link) {
      var match = id && link.hash === "#" + id;
      link.classList.toggle("is-active", !!match);
      if (match) {
        next = link;
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    activeLink = next;
    positionIndicator();
  }

  var sections = links
    .map(function (link) {
      return document.querySelector(link.hash);
    })
    .filter(Boolean);
  var hero = document.getElementById("hero");

  if ("IntersectionObserver" in window && sections.length) {
    // Thin band just above the viewport's midpoint decides which section is "in view".
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          setActive(entry.target === hero ? null : entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
    if (hero) navObserver.observe(hero);
  }

  function activateLastIfAtBottom() {
    if (!sections.length) return;
    var atBottom = window.innerHeight + window.scrollY >= root.scrollHeight - 2;
    if (atBottom) setActive(sections[sections.length - 1].id);
  }

  window.addEventListener("resize", positionIndicator);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionIndicator);
  }

  /* ---------- 3. Mobile menu ---------- */

  var menuBtn = nav ? nav.querySelector(".nav__menu-btn") : null;

  function isMenuOpen() {
    return !!nav && nav.classList.contains("is-open");
  }

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  if (nav && menuBtn && linkList) {
    menuBtn.addEventListener("click", function () {
      var open = !isMenuOpen();
      setMenu(open);
      if (open && links[0]) links[0].focus();
    });

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isMenuOpen()) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    nav.addEventListener("focusout", function (event) {
      if (isMenuOpen() && !nav.contains(event.relatedTarget)) setMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (isMenuOpen() && !nav.contains(event.target)) setMenu(false);
    });

    desktopQuery.addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
      positionIndicator();
    });
  }

  /* ---------- 6. Section number count-up ---------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll(".section-head__num"));

  function prepareCounter(label) {
    var match = label.textContent.trim().match(/^(\d+)\s+(.+)$/);
    if (!match) return;
    var digits = document.createElement("span");
    digits.className = "section-head__digits";
    digits.setAttribute("aria-hidden", "true");
    digits.textContent = reduceMotion ? match[1] : match[1].replace(/\d/g, "0");

    var srDigits = document.createElement("span");
    srDigits.className = "visually-hidden";
    srDigits.textContent = match[1];

    label.textContent = "";
    label.appendChild(digits);
    label.appendChild(srDigits);
    label.appendChild(document.createTextNode(" " + match[2]));
    label._counter = { el: digits, target: parseInt(match[1], 10), width: match[1].length, done: reduceMotion };
  }

  function pad(value, width) {
    var s = String(value);
    while (s.length < width) s = "0" + s;
    return s;
  }

  function runCounter(label) {
    var c = label._counter;
    if (!c || c.done) return;
    c.done = true;
    var duration = 700;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      c.el.textContent = pad(Math.round(eased * c.target), c.width);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  counters.forEach(prepareCounter);

  /* ---------- 4. Scroll reveals ---------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function revealNow(el, delayMs) {
    el.style.setProperty("--reveal-delay", delayMs + "ms");
    el.classList.add("is-revealed");
    var nested = el.querySelectorAll(".section-head__num");
    Array.prototype.forEach.call(nested, function (label) {
      if (reduceMotion) {
        runCounter(label);
      } else {
        setTimeout(function () {
          runCounter(label);
        }, delayMs + 200);
      }
    });
  }

  // Clipped elements report a zero-size rect to IntersectionObserver in Chromium,
  // so reveals use a rAF-throttled bounding-rect check instead.
  var pendingReveals = reduceMotion ? [] : revealEls.slice();

  if (reduceMotion) {
    revealEls.forEach(function (el) {
      revealNow(el, 0);
    });
  }

  function checkReveals() {
    if (!pendingReveals.length) return;
    var limit = window.innerHeight * 0.9;
    var batch = 0;
    var rest = [];
    pendingReveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < limit && rect.bottom > 0) {
        revealNow(el, batch * 60);
        batch += 1;
      } else {
        rest.push(el);
      }
    });
    pendingReveals = rest;
  }

  checkReveals();
  window.addEventListener("load", checkReveals);

  /* ---------- 7. Clickable project cards ---------- */

  // Card click opens the first action link; the card itself is not focusable,
  // so the real <a> remains the only keyboard/screen-reader entry point.
  Array.prototype.forEach.call(document.querySelectorAll(".project"), function (card) {
    var primary = card.querySelector(".project__actions a[href]");
    if (!primary) return;
    card.classList.add("is-linked");

    card.addEventListener("click", function (event) {
      if (event.button !== 0 || event.defaultPrevented) return;
      if (event.target.closest("a, button")) return;
      var selection = window.getSelection();
      if (selection && String(selection).length) return;
      window.open(primary.href, "_blank", "noopener");
    });
  });

  /* ---------- 5. Level gauge ---------- */

  var gaugeFill = null;

  if (!reduceMotion) {
    var gauge = document.createElement("div");
    gauge.className = "gauge";
    gauge.setAttribute("aria-hidden", "true");
    gaugeFill = document.createElement("div");
    gaugeFill.className = "gauge__fill";
    gauge.appendChild(gaugeFill);
    document.body.appendChild(gauge);
  }

  function updateGauge() {
    if (!gaugeFill) return;
    var max = root.scrollHeight - window.innerHeight;
    var progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    gaugeFill.style.transform = "scaleY(" + progress.toFixed(4) + ")";
  }

  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      updateGauge();
      checkReveals();
      activateLastIfAtBottom();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    updateGauge();
    checkReveals();
  });
  updateGauge();
})();
