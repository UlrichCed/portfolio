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

  /* ---- En-tête : bordure au défilement + bouton « haut de page » ---- */
  const header = document.querySelector(".site-header");
  const toTop = document.getElementById("to-top");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Navigation active au défilement (scrollspy) ---- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-menu a[href^='#']"));
  const sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

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
  function setFooterYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }
  setFooterYear();

  /* ---- Traduction FR / EN ---- */
  /* Chaque élément traduisible porte un attribut data-en (texte anglais).
     Au premier changement de langue, le texte français d'origine est mis
     en cache dans data-fr afin de pouvoir revenir en arrière. Le choix est
     mémorisé (localStorage) et partagé entre les pages du site. */
  const LANG_KEY = "redfox-lang";

  function setLanguage(lang) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.fr;
    });
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "fr");
    setFooterYear(); // le span #year est recréé par la traduction du pied de page
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
  }

  const langButtons = document.querySelectorAll(".lang-btn");
  if (langButtons.length) {
    langButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { setLanguage(btn.dataset.lang); });
    });
    let savedLang = "fr";
    try { savedLang = localStorage.getItem(LANG_KEY) || "fr"; } catch (_) {}
    if (savedLang === "en") setLanguage("en");
  }

  /* ---- Effet « machine à écrire » (hero) ---- */
  const typed = document.getElementById("typed");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typed && !reduceMotion) {
    const phrases = [
      "I test your defenses.",
      "I find the gaps.",
      "I map the threat.",
      "I prove the risk.",
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

  /* ---- Formulaire de contact ---- */
  /* Envoi vers la fonction Cloudflare /api/contact (email réel dans la boîte
     Proton). Si la fonction est indisponible ou non configurée, repli
     automatique sur le client mail du visiteur (mailto). */
  const form = document.getElementById("contact-form");
  const DEST = "holyspyware@proton.me";
  if (form) {
    const statusEl = document.getElementById("form-status");
    const btn = document.getElementById("cf-submit");

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      statusEl.className = "form-status" + (kind ? " is-" + kind : "");
    }

    function mailtoFallback(name, email, message) {
      const subject = "Prise de contact — " + name;
      const body =
        "Nom / Organisation : " + name + "\n" +
        "Email : " + email + "\n\n" + message;
      // encodeURIComponent neutralise toute injection dans l'URL mailto
      window.location.href =
        "mailto:" + DEST +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      // Pot de miel : si rempli, c'est un bot → on ne fait rien.
      if (form.elements.website && form.elements.website.value) return;

      const name = (form.elements.name.value || "").trim();
      const email = (form.elements.email.value || "").trim();
      const message = (form.elements.message.value || "").trim();

      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }
      setStatus("", "");

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, email: email, message: message, website: "" })
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (out) {
            return { ok: res.ok, out: out };
          });
        })
        .then(function (r) {
          if (r.ok && r.out && r.out.ok) {
            form.reset();
            setStatus("Message envoyé. Je vous réponds sous 48 h.", "ok");
          } else if (r.out && r.out.error === "not_configured") {
            // Backend pas encore configuré → repli mailto
            mailtoFallback(name, email, message);
          } else {
            setStatus("Envoi impossible pour l'instant. Écrivez-moi à " + DEST, "err");
          }
        })
        .catch(function () {
          // Fonction indisponible (ex. ouverture du fichier en local) → repli mailto
          mailtoFallback(name, email, message);
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }
})();
