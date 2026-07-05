/* ============================================================
   Portfolio — interactions
   Vanilla JS, aucune dépendance. Thème unique (rouge & noir).
   ============================================================ */
(function () {
  "use strict";

  /* ---- Menu mobile ---- */
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const open = navMenu.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---- En-tête : bordure au défilement ---- */
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Animations d'apparition ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Année du footer ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---- Effet « machine à écrire » (hero) ---- */
  const typed = document.getElementById("typed");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typed && !reduceMotion) {
    const phrases = [
      "I break in.",
      "I escalate.",
      "I pivot.",
      "I exfiltrate — in a lab.",
      "I report everything.",
      "You get stronger."
    ];
    let p = 0, c = 0, deleting = false;

    function schedule(ms) { window.setTimeout(tick, ms); }
    function tick() {
      const word = phrases[p];
      typed.textContent = word.slice(0, c);
      if (!deleting) {
        if (c < word.length) { c++; return schedule(45 + Math.random() * 55); }
        deleting = true;
        return schedule(1400); // pause en fin de phrase
      }
      if (c > 0) { c--; return schedule(28); }
      deleting = false;
      p = (p + 1) % phrases.length;
      return schedule(260);
    }
    schedule(700);
  } else if (typed) {
    typed.textContent = "Recon. Exploit. Report. Protect.";
  }

  /* ---- Formulaire de contact : ouvre le client mail (aucun backend) ---- */
  const form = document.getElementById("contact-form");
  const DEST = "holyspyware@proton.me";
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const name = (form.elements.name.value || "").trim();
      const email = (form.elements.email.value || "").trim();
      const message = (form.elements.message.value || "").trim();

      const subject = "Prise de contact — " + name;
      const body =
        "Nom / Organisation : " + name + "\n" +
        "Email : " + email + "\n\n" +
        message;

      // encodeURIComponent neutralise toute injection dans l'URL mailto
      const href =
        "mailto:" + DEST +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;
    });
  }
})();
