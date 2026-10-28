// Custom cursor ring + dot. Fine pointers only, off under prefers-reduced-motion;
// the system cursor stays over text fields and whenever this script does not run.
(function () {
  "use strict";

  var finePointer = window.matchMedia("(pointer: fine)");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finePointer.matches || reduceMotion.matches) return;

  var INTERACTIVE = "a, button, [role='button'], summary, label";
  var TEXT_FIELD = "input, textarea, select, [contenteditable='true']";
  var CARD = ".project.is-linked";

  var root = document.documentElement;
  var cursor = document.createElement("div");
  cursor.className = "cursor is-hidden";
  cursor.setAttribute("aria-hidden", "true");

  var ring = document.createElement("div");
  ring.className = "cursor__ring";
  var shape = document.createElement("div");
  shape.className = "cursor__ring-shape";
  var label = document.createElement("span");
  label.className = "cursor__label";
  label.textContent = "Open";
  ring.appendChild(shape);
  ring.appendChild(label);

  var dot = document.createElement("div");
  dot.className = "cursor__dot";

  cursor.appendChild(ring);
  cursor.appendChild(dot);
  document.body.appendChild(cursor);
  root.classList.add("has-cursor");

  var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var ringPos = { x: target.x, y: target.y };
  var dotPos = { x: target.x, y: target.y };
  var RING_EASE = 0.18;
  var DOT_EASE = 0.45;
  var rafId = null;
  var seen = false;

  function place(el, pos) {
    el.style.transform = "translate3d(" + pos.x.toFixed(2) + "px, " + pos.y.toFixed(2) + "px, 0)";
  }

  function tick() {
    ringPos.x += (target.x - ringPos.x) * RING_EASE;
    ringPos.y += (target.y - ringPos.y) * RING_EASE;
    dotPos.x += (target.x - dotPos.x) * DOT_EASE;
    dotPos.y += (target.y - dotPos.y) * DOT_EASE;
    place(ring, ringPos);
    place(dot, dotPos);

    var settled =
      Math.abs(target.x - ringPos.x) < 0.1 &&
      Math.abs(target.y - ringPos.y) < 0.1 &&
      Math.abs(target.x - dotPos.x) < 0.1 &&
      Math.abs(target.y - dotPos.y) < 0.1;
    rafId = settled ? null : requestAnimationFrame(tick);
  }

  function wake() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function updateState(el) {
    var overTextField = !!(el && el.closest && el.closest(TEXT_FIELD));
    var overInteractive = !overTextField && !!(el && el.closest && el.closest(INTERACTIVE));
    var overCard = !overTextField && !overInteractive && !!(el && el.closest && el.closest(CARD));
    cursor.classList.toggle("is-hidden", overTextField || !seen);
    cursor.classList.toggle("is-hover", overInteractive);
    cursor.classList.toggle("is-open", overCard);
  }

  document.addEventListener(
    "pointermove",
    function (event) {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
        cursor.classList.add("is-hidden");
        return;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      if (!seen) {
        seen = true;
        ringPos.x = dotPos.x = target.x;
        ringPos.y = dotPos.y = target.y;
      }
      updateState(event.target);
      wake();
    },
    { passive: true }
  );

  document.addEventListener("pointerover", function (event) {
    if (seen) updateState(event.target);
  });

  document.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "touch") return;
    cursor.classList.add("is-down");
  });

  document.addEventListener("pointerup", function () {
    cursor.classList.remove("is-down");
  });

  // pointerleave/enter do not bubble, so listen on the root element itself
  root.addEventListener("pointerleave", function () {
    cursor.classList.add("is-hidden");
  });

  root.addEventListener("pointerenter", function () {
    if (seen) cursor.classList.remove("is-hidden");
  });

  window.addEventListener("blur", function () {
    cursor.classList.remove("is-down");
  });

  // Fall back to the system cursor if the pointer type or motion preference changes.
  function disable() {
    root.classList.remove("has-cursor");
    cursor.classList.add("is-hidden");
  }
  finePointer.addEventListener("change", function (event) {
    if (!event.matches) disable();
  });
  reduceMotion.addEventListener("change", function (event) {
    if (event.matches) disable();
  });
})();
