// Blog pages: theme toggle and mobile menu, matching the portfolio's behaviour.
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */

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
    if (themeBtn) themeBtn.setAttribute("aria-checked", String(theme === "light"));
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {
        /* storage unavailable; theme still applies for this page */
      }
    }
  }

  // Saved choice wins; otherwise dark
  applyTheme(readSavedTheme() || "dark", false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
    });
  }

  /* ---------- Mobile menu ---------- */

  var nav = document.querySelector(".nav");
  var menuBtn = nav ? nav.querySelector(".nav__menu-btn") : null;
  var firstLink = nav ? nav.querySelector(".nav__link") : null;
  var desktopQuery = window.matchMedia("(min-width: 901px)");

  function isMenuOpen() {
    return !!nav && nav.classList.contains("is-open");
  }

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = !isMenuOpen();
      setMenu(open);
      if (open && firstLink) firstLink.focus();
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest(".nav__link")) setMenu(false);
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
    });
  }
})();
