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

  /* ---------- Article features (post pages only) ---------- */

  var article = document.querySelector("article.post");
  if (!article) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Reading progress: 0 when the article top reaches the viewport top, 1 when its bottom reaches the viewport bottom */

  var bar = document.createElement("div");
  bar.className = "read-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  function updateProgress() {
    if (reduceMotion.matches) return;
    var rect = article.getBoundingClientRect();
    var span = Math.max(1, rect.height - window.innerHeight);
    var progress = Math.min(1, Math.max(0, -rect.top / span));
    bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
  }

  var scrollQueued = false;
  function onScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      updateProgress();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateProgress();

  /* Table of contents from the article's own h2s (not the takeaways or author headings) */

  var headings = Array.prototype.slice.call(article.querySelectorAll(":scope > h2"));
  var generated = {};

  if (headings.length) {
    var used = {};
    headings.forEach(function (h) {
      if (h.id) used[h.id] = true;
    });

    headings.forEach(function (h) {
      if (h.id) return;
      var base =
        h.textContent
          .toLowerCase()
          .replace(/['\u2019]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "section";
      var slug = base;
      var n = 2;
      while (used[slug] || document.getElementById(slug)) slug = base + "-" + n++;
      used[slug] = true;
      generated[slug] = true;
      h.id = slug;
    });

    var toc = document.createElement("nav");
    toc.className = "toc";
    toc.setAttribute("aria-label", "On this page");

    var box = document.createElement("details");
    box.className = "toc__box";
    var label = document.createElement("summary");
    label.className = "toc__label";
    label.textContent = "On this page";
    var list = document.createElement("ol");
    list.className = "toc__list";

    var tocLinks = {};
    headings.forEach(function (h) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + h.id;
      link.textContent = h.textContent;
      tocLinks[h.id] = link;
      item.appendChild(link);
      list.appendChild(item);
    });

    box.appendChild(label);
    box.appendChild(list);
    toc.appendChild(box);
    article.parentNode.insertBefore(toc, article);
    article.parentNode.classList.add("has-toc");

    // Wide screens: the list is a permanent sidebar; narrow screens: collapsed box
    var wideQuery = window.matchMedia("(min-width: 1100px)");
    function syncToc() {
      box.open = wideQuery.matches;
    }
    syncToc();
    wideQuery.addEventListener("change", syncToc);

    label.addEventListener("click", function (event) {
      if (wideQuery.matches) event.preventDefault();
    });

    list.addEventListener("click", function (event) {
      if (event.target.closest("a") && !wideQuery.matches) box.open = false;
    });

    var activeLink = null;
    function updateActive() {
      var line = window.innerHeight * 0.3;
      var current = null;
      headings.forEach(function (h) {
        if (h.getBoundingClientRect().top <= line) current = h;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = headings[headings.length - 1];
      }
      var next = current ? tocLinks[current.id] : null;
      if (next === activeLink) return;
      if (activeLink) {
        activeLink.classList.remove("is-active");
        activeLink.removeAttribute("aria-current");
      }
      if (next) {
        next.classList.add("is-active");
        next.setAttribute("aria-current", "location");
      }
      activeLink = next;
    }

    if ("IntersectionObserver" in window) {
      var headingObserver = new IntersectionObserver(updateActive, { rootMargin: "0px 0px -70% 0px" });
      headings.forEach(function (h) {
        headingObserver.observe(h);
      });
      // Headings alone never reach the 30% line at the very end of the page
      var postFoot = article.querySelector(".post-foot");
      if (postFoot) new IntersectionObserver(updateActive, { threshold: [0, 1] }).observe(postFoot);
    }
    updateActive();

    // Ids made here do not exist when the browser first resolves a #hash
    if (location.hash.length > 1) {
      try {
        var hashId = decodeURIComponent(location.hash.slice(1));
        var target = generated[hashId] ? document.getElementById(hashId) : null;
        if (target) target.scrollIntoView();
      } catch (e) {
        /* malformed hash */
      }
    }
  }

  /* Copy buttons on code blocks */

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var previous = document.activeElement;
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        /* falls through to reject */
      }
      document.body.removeChild(field);
      if (previous && previous.focus) previous.focus();
      if (ok) resolve();
      else reject();
    });
  }

  Array.prototype.forEach.call(article.querySelectorAll("pre"), function (pre) {
    var wrap = document.createElement("div");
    wrap.className = "code-block";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.setAttribute("aria-label", "Copy code");
    button.textContent = "Copy";

    var status = document.createElement("span");
    status.className = "visually-hidden";
    status.setAttribute("role", "status");

    wrap.appendChild(button);
    wrap.appendChild(status);

    var timer = null;
    function flash(text, announce) {
      button.textContent = text;
      button.classList.toggle("is-copied", text === "Copied");
      status.textContent = announce;
      clearTimeout(timer);
      timer = setTimeout(function () {
        button.textContent = "Copy";
        button.classList.remove("is-copied");
        status.textContent = "";
      }, 1800);
    }

    button.addEventListener("click", function () {
      copyText(pre.textContent).then(
        function () {
          flash("Copied", "Code copied to clipboard");
        },
        function () {
          flash("Copy failed", "Copy failed");
        }
      );
    });
  });
})();
