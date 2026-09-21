/* Apogee Labs — the whole motion layer. No dependencies.
   Everything here is an enhancement: with JS off, or motion reduced, the CSS
   already renders every word and every layer in flow. */
(function () {
  "use strict";

  /* -- 0. Ribh's store links ------------------------------------------------
     Ribh isn't hosted here, so there's no smart-link page to do the switching.
     Desktop keeps both stores named; a phone keeps only its own. Runs before
     the reduced-motion bail-out — it's navigation, not motion. */
  var rIos = document.getElementById("ribh-ios"),
      rPlay = document.getElementById("ribh-play");
  if (rIos && rPlay) {
    var rUa = navigator.userAgent || "";
    var mine = /Android/.test(rUa) ? rPlay
             : (/iPad|iPhone|iPod/.test(rUa) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) ? rIos
             : null;
    if (mine) {
      (mine === rIos ? rPlay : rIos).remove();
      mine.textContent = "Get the app";
      mine.setAttribute("aria-label", "Get the app \u2014 Ribh");
    }
  }

  var reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  /* -- 1. Entry reveals -----------------------------------------------------
     Chrome drives these from `animation-timeline: view()` in CSS. Everywhere
     else, one observer flips a class. */
  var cssTimeline = window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()");
  if (!cssTimeline) {
    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { ro.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }
  }

  /* -- 2. Pinned sections ---------------------------------------------------
     Each track publishes its own 0..1 scroll progress as `--p`; the CSS reads
     it for every cross-fade, bar and tilt. Only on-screen tracks are measured,
     and only once per frame. */
  var tracks = [].slice.call(document.querySelectorAll(".pin__track"));
  if (!tracks.length) return;

  var live = tracks.slice();
  if ("IntersectionObserver" in window) {
    live = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = live.indexOf(e.target);
        if (e.isIntersecting && i < 0) live.push(e.target);
        else if (!e.isIntersecting && i >= 0) live.splice(i, 1);
      });
      if (live.length) request();
    }, { rootMargin: "20% 0px" });
    tracks.forEach(function (t) { io.observe(t); });
  }

  // Elements whose text tweens with their section's progress.
  var counters = [].slice.call(document.querySelectorAll("[data-count]")).map(function (el) {
    return {
      el: el,
      track: el.closest(".pin__track"),
      to: parseFloat(el.dataset.count),
      from: parseFloat(el.dataset.countFrom || 0),
      at: parseFloat(el.dataset.countAt || 0.6),
      span: parseFloat(el.dataset.countSpan || 0.18),
      dp: (el.dataset.count.split(".")[1] || "").length,
      last: null
    };
  });

  var queued = false;
  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(frame);
  }

  function frame() {
    queued = false;
    var vh = window.innerHeight;
    for (var i = 0; i < live.length; i++) {
      var r = live[i].getBoundingClientRect();
      var span = r.height - vh;
      var p = span > 0 ? -r.top / span : 0;
      live[i].style.setProperty("--p", (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(4));
    }
    for (var c = 0; c < counters.length; c++) {
      var k = counters[c];
      if (live.indexOf(k.track) < 0) continue;
      var t = (parseFloat(k.track.style.getPropertyValue("--p")) - k.at) / k.span;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      t = 1 - Math.pow(1 - t, 3);                       // ease out
      var v = (k.from + (k.to - k.from) * t).toFixed(k.dp);
      if (v !== k.last) { k.el.textContent = v; k.last = v; }
    }
  }

  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request, { passive: true });
  request();

  /* -- 3. Magnetic buttons (pointer devices only) -------------------------- */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".btn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.14).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.22).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", function () {
        b.style.removeProperty("--mx");
        b.style.removeProperty("--my");
      });
    });
  }
})();
