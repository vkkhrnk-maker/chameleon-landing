import { WORKS_LQIP } from "./lqip-data.mjs";

// ─── Blur-up (LQIP) for the works gallery ───
// A ~24px base64 copy of each photo shows instantly, blurred, while
// the real (lazy-loaded) file downloads; the sharp image then fades
// in over it. Progressive enhancement: without JS nothing changes —
// images render normally. Ported from the syno-art-map prototype,
// but revealing on the img load event (with a complete-check to
// dodge the cached-image race) instead of the prototype's timer.
function initWorksBlurUp() {
  document.querySelectorAll(".works-slide-image").forEach((img) => {
    const file = (img.getAttribute("src") || "").split("/").pop();
    const lq = WORKS_LQIP[file];
    if (!lq) return;

    if (img.complete && img.naturalWidth > 0) {
      // Already loaded (cache) — skip the placeholder entirely.
      return;
    }

    // The placeholder goes ON TOP of the image and fades away once
    // the real file arrives. The img itself is never hidden: hiding
    // it (opacity: 0) made Chrome treat the lazy image as
    // non-rendered and skip loading it entirely — photos never
    // arrived and the gallery stayed blurred forever.
    const ph = document.createElement("span");
    ph.className = "works-lqip";
    ph.setAttribute("aria-hidden", "true");
    ph.style.backgroundImage = `url("${lq}")`;
    img.parentNode.insertBefore(ph, img.nextSibling);

    const reveal = () => ph.classList.add("bu-done");
    ph.addEventListener(
      "transitionend",
      () => ph.remove(),
      { once: true }
    );
    img.addEventListener("load", reveal, { once: true });
    img.addEventListener("error", reveal, { once: true });
    // Safety net: never let a stuck load event leave the slide
    // blurred forever — force the fade after 8s regardless.
    setTimeout(reveal, 8000);
  });
}
initWorksBlurUp();

// Expose the actual scrollbar gutter width as a CSS custom property.
// Used by:
//   1. .mobile-menu { right: var(--scrollbar-width) } so the fixed
//      menu's right edge aligns with the page's right edge — the
//      close X then sits exactly where the burger was.
//   2. body.is-*-open { padding-right: var(--scrollbar-width) } so
//      when a modal/menu locks scroll and the scrollbar disappears,
//      the page doesn't widen and content doesn't shift sideways.
// On touch devices with overlay scrollbars this evaluates to 0 — no-op.
// Avoids the cross-browser inconsistencies of scrollbar-gutter: stable
// (which had different behavior on Android Chrome).
const setScrollbarWidthVar = () => {
  const w = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  document.documentElement.style.setProperty("--scrollbar-width", `${w}px`);
};
setScrollbarWidthVar();
window.addEventListener("resize", setScrollbarWidthVar);

const feedbackButtons = document.querySelectorAll("[data-feedback-message]");
const telegramLinkButtons = document.querySelectorAll("[data-telegram-link]");
const briefOpenButtons = document.querySelectorAll("[data-brief-open]");
const briefModal = document.querySelector(".brief-modal");
const briefCloseButtons = document.querySelectorAll("[data-brief-close]");
const briefModalDialog = document.querySelector(".brief-modal-dialog");
const briefForm = document.querySelector(".brief-form");
const briefFileInput = document.querySelector(".brief-form-file");
const briefAttachButton = document.querySelector(".brief-form-attach-button");
const briefAttachState = document.querySelector(".brief-form-attach-state");
const briefFileList = document.querySelector(".brief-form-file-list");
const briefFormInputs = document.querySelectorAll(".brief-form-input[required], .brief-form-textarea[required]");
const successModal = document.querySelector(".success-modal");
const successCloseButtons = document.querySelectorAll("[data-success-close]");
const coverHeaders = document.querySelectorAll(".cover-header");
const coverAltTypedNodes = document.querySelectorAll(".cover-alt-title-dynamic[data-typed-words]");
const clientsStepsList = document.querySelector(".clients-network-steps");
const clientsSteps = document.querySelectorAll(".clients-network-step");
const worksTabs = document.querySelectorAll(".works-tab");
const worksSlides = document.querySelectorAll(".works-slide");
const worksSliderShell = document.querySelector(".works-slider-shell");
const storeTabs = document.querySelectorAll(".store-tab");
const storeCards = document.querySelectorAll(".store-card");
const storeSliderShell = document.querySelector(".store-slider-shell, .store-grid");
const choiceSection = document.querySelector(".choice-scroll");
const choiceSliderShell = document.querySelector(".choice-slider-shell");
const choiceSliderTrack = document.querySelector(".choice-slider-track");
const aboutTelegramButton = document.querySelector(".about-telegram");
const businessVisual = document.querySelector(".business-visual");
const testimonialsSection = document.querySelector(".testimonials-scroll");
const testimonialsCardsLayer = document.querySelector(".testimonials-cards-layer");
const testimonialsCards = document.querySelectorAll(".testimonial-card");
const faqItems = document.querySelectorAll(".faq-item");
const COVER_MENU_BREAKPOINT = 1100;

if (feedbackButtons.length > 0) {
  const feedback = createFeedback();

  feedbackButtons.forEach((button) => {
    button.addEventListener("click", () => {
      feedback.textContent = button.dataset.feedbackMessage;
      feedback.classList.add("is-visible");

      window.clearTimeout(feedback.hideTimer);
      feedback.hideTimer = window.setTimeout(() => {
        feedback.classList.remove("is-visible");
      }, 1800);
    });
  });
}

if (telegramLinkButtons.length > 0) {
  // All "Получить консультацию" / "Заказать" buttons now scroll to
  // the footer-contact section (#contacts) — the block with the two
  // cards (brief form + Telegram link) — rather than opening
  // Telegram directly. Lets the user pick which channel to use
  // and keeps them on-page. data-telegram-link is preserved as a
  // legacy marker; not used as a URL anymore.
  telegramLinkButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const contacts = document.querySelector("#contacts");
      if (!contacts) {
        // Fallback: open the Telegram link directly if the contacts
        // section isn't on this page for any reason.
        const telegramLink = button.dataset.telegramLink;
        if (telegramLink) {
          window.open(telegramLink, "_blank", "noopener,noreferrer");
        }
        return;
      }
      contacts.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

if (briefModal && briefModalDialog && briefOpenButtons.length > 0) {
  initBriefModal();
}

if (coverHeaders.length > 0) {
  initCoverHeaders();
}

if (coverAltTypedNodes.length > 0) {
  initCoverAltTyping();
}

initMotionSystem();

if (clientsStepsList && clientsSteps.length > 0) {
  initClientsNetworkReveal();
  initHorizontalDragScroll(clientsStepsList);
}

if (worksTabs.length > 0 && worksSlides.length > 0 && worksSliderShell) {
  initWorksSection();
}

if (storeTabs.length > 0 && storeCards.length > 0) {
  initStoreSection();
}

if (storeSliderShell) {
  initHorizontalDragScroll(storeSliderShell);
}

// Choice section now uses CSS sticky-stack on desktop (no JS forced scroll)
// if (choiceSection && choiceSliderShell) {
//   initChoiceForcedScroll();
// }

if (aboutTelegramButton) {
  initMagneticTelegram();
}

if (businessVisual) {
  initBusinessVisualHover();
}

if (testimonialsSection && testimonialsCardsLayer && testimonialsCards.length > 0) {
  initTestimonialsScroll();
}

if (faqItems.length > 0) {
  initFaq();
}

initScrollPointerLock();
initAnchorLinks();
initFloatHeader();
initFiltersByContent();
initFilterUrlState();
initStorePriceContrast();
initWorksModal();
initCarouselHints();
initHeroParallax();
initBriefFormPolish();
initFloatHeaderHideOnModal();
initCookieBanner();
initCoverCtaSpotlight();
initStoreDetailModal();
initMobileMenu();

function initFiltersByContent() {
  // Hide filter tabs that have zero matching cards
  const groups = [
    { tabs: ".works-tab", cards: ".works-slide", attr: "data-categories" },
    { tabs: ".store-tab", cards: ".store-card", attr: "data-categories" },
  ];
  groups.forEach(({ tabs, cards, attr }) => {
    const tabEls = document.querySelectorAll(tabs);
    const cardEls = document.querySelectorAll(cards);
    if (!tabEls.length || !cardEls.length) return;
    const cats = new Set();
    cardEls.forEach((c) => {
      (c.dataset.categories || "").split(/\s+/).forEach((cat) => cat && cats.add(cat));
    });
    tabEls.forEach((tab) => {
      const filter = tab.dataset.filter;
      if (!filter || filter === "all") return;
      if (!cats.has(filter)) tab.hidden = true;
    });
  });
}

function initFilterUrlState() {
  const handlers = [
    { tabs: ".works-tab", param: "works" },
    { tabs: ".store-tab", param: "store" },
  ];
  const params = new URLSearchParams(location.search);
  handlers.forEach(({ tabs, param }) => {
    const tabEls = document.querySelectorAll(tabs);
    if (!tabEls.length) return;
    const initial = params.get(param);
    if (initial) {
      const target = Array.from(tabEls).find((t) => t.dataset.filter === initial);
      if (target && !target.classList.contains("is-active")) target.click();
    }
    tabEls.forEach((tab) => {
      tab.addEventListener("click", () => {
        const f = tab.dataset.filter;
        const p = new URLSearchParams(location.search);
        if (f && f !== "all") p.set(param, f);
        else p.delete(param);
        const qs = p.toString();
        history.replaceState(null, "", qs ? `?${qs}${location.hash}` : location.pathname + location.hash);
      });
    });
  });
}

function initStorePriceContrast() {
  // handled via CSS
}

function initCarouselHints() {
  // Removed — was visually distracting
}

function initHeroParallax() {
  const ellipses = document.querySelector(".hero-ellipses");
  if (!ellipses) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 720px)").matches) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;
  let rafPending = false;
  let targetX = 0;
  let targetY = 0;
  let curX = 0;
  let curY = 0;
  function loop() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;
    ellipses.style.setProperty("--parallax-x", curX.toFixed(2) + "px");
    ellipses.style.setProperty("--parallax-y", curY.toFixed(2) + "px");
    if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
      requestAnimationFrame(loop);
    } else {
      rafPending = false;
    }
  }
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const cx = (e.clientX - r.left - r.width / 2) / r.width;
    const cy = (e.clientY - r.top - r.height / 2) / r.height;
    targetX = cx * 18;
    targetY = cy * 12;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(loop);
    }
  });
  hero.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(loop);
    }
  });
}

function initBriefFormPolish() {
  const form = document.querySelector(".brief-form");
  if (!form) return;
  const inputs = form.querySelectorAll(".brief-form-input, .brief-form-textarea");
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      if (input.required && !input.value.trim()) {
        input.classList.add("is-invalid");
      } else if (input.checkValidity()) {
        input.classList.remove("is-invalid");
      }
    });
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid") && input.value.trim()) {
        input.classList.remove("is-invalid");
      }
    });
  });
  // Auto-focus first chip when modal opens
  const modal = document.querySelector(".brief-modal");
  if (modal) {
    const observer = new MutationObserver(() => {
      if (!modal.hasAttribute("hidden")) {
        const first = form.querySelector(".brief-chip input");
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 240);
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ["hidden", "class"] });
  }
  initPhoneMask();
}

function initPhoneMask() {
  const inputs = document.querySelectorAll("[data-phone-mask]");
  inputs.forEach((input) => {
    function format(value) {
      // If user starts typing a non-digit (likely email), don't mask
      if (/[A-Za-z@]/.test(value)) return value;
      const digits = value.replace(/\D/g, "");
      if (!digits) return "";
      let normalized = digits;
      if (normalized[0] === "8") normalized = "7" + normalized.slice(1);
      if (normalized[0] !== "7") normalized = "7" + normalized;
      const d = normalized.slice(0, 11);
      let out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 4) out += ")";
      if (d.length > 4) out += " " + d.slice(4, 7);
      if (d.length > 7) out += "-" + d.slice(7, 9);
      if (d.length > 9) out += "-" + d.slice(9, 11);
      return out;
    }
    input.addEventListener("input", () => {
      const before = input.value;
      const formatted = format(before);
      if (before !== formatted) {
        input.value = formatted;
      }
    });
  });
}

function initCookieBanner() {
  const banner = document.querySelector("[data-cookie-banner]");
  if (!banner) return;
  const KEY = "cookie-consent-v1";
  if (localStorage.getItem(KEY) === "accepted") return;

  let shown = false;
  let listenerArmed = false;
  let fallbackTimer = null;
  const reveal = () => {
    if (shown) return;
    shown = true;
    banner.classList.add("is-shown");
    banner.setAttribute("aria-hidden", "false");
    window.removeEventListener("scroll", onScroll);
    if (fallbackTimer) clearTimeout(fallbackTimer);
  };
  const onScroll = () => {
    if (!listenerArmed) return;
    if (window.scrollY > 200) reveal();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // Arm the scroll trigger only after the browser has finished restoring scroll
  setTimeout(() => { listenerArmed = true; }, 600);
  fallbackTimer = setTimeout(reveal, 12000);

  banner.querySelector("[data-cookie-accept]")?.addEventListener("click", () => {
    localStorage.setItem(KEY, "accepted");
    banner.classList.remove("is-shown");
    banner.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      banner.style.display = "none";
    }, 380);
  });
}

function initFloatHeaderHideOnModal() {
  const modal = document.querySelector(".brief-modal");
  const float = document.querySelector("[data-float-header]");
  if (!modal || !float) return;
  const observer = new MutationObserver(() => {
    if (modal.hasAttribute("hidden")) {
      float.classList.remove("is-hidden-by-modal");
    } else {
      float.classList.add("is-hidden-by-modal");
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ["hidden"] });
}

function initWorksModal() {
  const slides = document.querySelectorAll(".works-slide");
  if (!slides.length) return;
  let modal;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "works-modal";
    modal.innerHTML = `
      <div class="works-modal-backdrop" data-modal-close></div>
      <article class="works-modal-card">
        <button class="works-modal-close" type="button" data-modal-close aria-label="Закрыть">
          <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <img class="works-modal-image" alt="" />
        <div class="works-modal-info">
          <div class="works-modal-badges"></div>
          <h3 class="works-modal-title"></h3>
        </div>
      </article>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    return modal;
  }
  function open(slide) {
    const m = ensureModal();
    const img = slide.querySelector(".works-slide-image");
    const badges = slide.querySelectorAll(".works-slide-badge");
    const title = slide.querySelector(".works-slide-title")?.textContent || "";
    m.querySelector(".works-modal-image").src = img?.src || "";
    m.querySelector(".works-modal-image").alt = title;
    const bw = m.querySelector(".works-modal-badges");
    bw.innerHTML = "";
    badges.forEach((b) => {
      const span = document.createElement("span");
      span.className = "works-modal-badge";
      span.textContent = b.textContent;
      bw.appendChild(span);
    });
    m.querySelector(".works-modal-title").textContent = title;
    m.classList.add("is-open");
    /* Use class-based scroll lock so the body also gets the
       padding-right compensation that prevents horizontal layout
       shift when the scrollbar disappears. */
    document.body.classList.add("is-works-modal-open");
  }
  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("is-works-modal-open");
  }
  slides.forEach((slide) => {
    slide.style.cursor = "pointer";
    slide.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      open(slide);
    });
  });
}

function initScrollPointerLock() {
  // Disable hover/pointer events while the user is actively scrolling.
  // Without this, hover-able cards (service-card, business-card, faq-item,
  // store-card, etc.) flash their :hover state every time the cursor
  // passes under them as they scroll past, which reads as visual noise
  // and tiny color/transform flickers.
  //
  // Pattern: set a class on <html> on every scroll, and remove it ~120ms
  // after the user stops. While the class is on, all hover/transition
  // effects are suppressed via a stylesheet rule.

  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    // Touch device — there's no hover state to suppress anyway.
    return;
  }

  let scrollTimer = 0;
  const html = document.documentElement;

  window.addEventListener(
    "scroll",
    () => {
      if (!html.classList.contains("is-scrolling")) {
        html.classList.add("is-scrolling");
      }
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        html.classList.remove("is-scrolling");
      }, 120);
    },
    { passive: true }
  );
}

function initAnchorLinks() {
  const links = document.querySelectorAll("a[data-anchor]");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const id = href.slice(1);
      const offset = 96;
      let targetY = 0;
      if (id && id !== "top") {
        const target = document.getElementById(id);
        if (!target) return;
        targetY = target.getBoundingClientRect().top + window.scrollY - offset;
      }
      event.preventDefault();
      smoothScrollTo(Math.max(0, targetY));
    });
  });
}

function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 4) return;
  const duration = Math.min(1200, 420 + Math.abs(distance) * 0.18);
  const startTime = performance.now();
  const ease = (t) => 1 - Math.pow(1 - t, 4);
  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initFloatHeader() {
  const header = document.querySelector("[data-float-header]");
  if (!header) return;
  const cover = document.querySelector(".cover");
  const burger = header.querySelector(".float-header-burger");
  const nav = header.querySelector(".float-header-nav");
  let lastY = window.scrollY;
  let ticking = false;

  const closeMenu = () => {
    header.classList.remove("is-menu-open");
    burger?.setAttribute("aria-expanded", "false");
    burger?.setAttribute("aria-label", "Открыть меню");
  };

  const setHeaderVisible = (visible) => {
    header.classList.toggle("is-visible", visible);
    header.setAttribute("aria-hidden", String(!visible));
    if (!visible) closeMenu();
  };

  burger?.addEventListener("click", () => {
    const willOpen = !header.classList.contains("is-menu-open");
    header.classList.toggle("is-menu-open", willOpen);
    burger.setAttribute("aria-expanded", String(willOpen));
    burger.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100 || window.innerWidth <= 720) closeMenu();
  });

  function update() {
    const y = window.scrollY;
    const dir = y - lastY;
    const coverBottom = cover ? cover.getBoundingClientRect().bottom + window.scrollY : 600;
    const past = y > coverBottom - 80;
    const scrollingUp = dir < -2;
    const scrollingDown = dir > 2;
    if (!past) {
      setHeaderVisible(false);
    } else if (scrollingUp) {
      setHeaderVisible(true);
    } else if (scrollingDown) {
      setHeaderVisible(false);
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  initScrollSpy();
}

function initScrollSpy() {
  const links = document.querySelectorAll(".float-header-link[href^='#']");
  if (!links.length) return;
  const map = new Map();
  links.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, link);
  });
  if (!map.size) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const link = map.get(visible[0].target);
      if (!link) return;
      links.forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
  );
  map.forEach((_, sec) => observer.observe(sec));
}

function createFeedback() {
  const feedback = document.createElement("p");
  feedback.id = "cta-feedback";
  feedback.setAttribute("aria-live", "polite");
  document.body.append(feedback);
  return feedback;
}

function initBusinessVisualHover() {
  if (
    window.innerWidth <= 1100 ||
    window.matchMedia("(hover: none), (pointer: coarse)").matches
  ) {
    return;
  }

  businessVisual.classList.add("is-interactive");

  const resetVisual = () => {
    businessVisual.style.setProperty("--business-shift-x", "0px");
    businessVisual.style.setProperty("--business-shift-y", "0px");
  };

  businessVisual.addEventListener("mousemove", (event) => {
    const rect = businessVisual.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const shiftX = ((event.clientX - centerX) / rect.width) * 20;
    const shiftY = ((event.clientY - centerY) / rect.height) * 16;

    businessVisual.style.setProperty("--business-shift-x", `${shiftX.toFixed(2)}px`);
    businessVisual.style.setProperty("--business-shift-y", `${shiftY.toFixed(2)}px`);
  });

  businessVisual.addEventListener("mouseleave", resetVisual);
  businessVisual.addEventListener("blur", resetVisual, true);
}

function initBriefModal() {
  let attachedFiles = [];

  const syncModalBodyState = () => {
    const hasOpenModal =
      briefModal?.classList.contains("is-open") || successModal?.classList.contains("is-open");

    document.body.classList.toggle("is-brief-modal-open", Boolean(hasOpenModal));
  };

  const openModal = (modal) => {
    if (!modal) {
      return;
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    syncModalBodyState();
    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      syncModalBodyState();
    });
  };

  const closeModal = (modal) => {
    if (!modal) {
      return;
    }

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    syncModalBodyState();
    window.setTimeout(() => {
      if (modal.getAttribute("aria-hidden") === "true") {
        modal.hidden = true;
        syncModalBodyState();
      }
    }, 220);
  };

  const resetBriefForm = () => {
    briefForm?.reset();
    attachedFiles.forEach((item) => {
      window.URL.revokeObjectURL(item.url);
    });
    attachedFiles = [];

    briefFormInputs.forEach((input) => {
      input.closest(".brief-form-field")?.classList.remove("is-invalid");
    });

    if (briefFileInput) {
      briefFileInput.value = "";
    }

    if (briefAttachState) {
      briefAttachState.hidden = true;
    }

    if (briefFileList) {
      briefFileList.innerHTML = "";
    }
  };

  const renderAttachedFiles = () => {
    if (!briefAttachState || !briefFileList) {
      return;
    }

    briefFileList.innerHTML = "";

    if (attachedFiles.length === 0) {
      briefAttachState.hidden = true;
      return;
    }

    briefAttachState.hidden = false;

    attachedFiles.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "brief-form-file-item";

      const link = document.createElement("a");
      link.className = "brief-form-file-link";
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const fileName = document.createElement("span");
      fileName.className = "brief-form-file-name";
      fileName.textContent = item.file.name;

      link.append(fileName);

      const removeButton = document.createElement("button");
      removeButton.className = "brief-form-file-remove";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "Удалить документ");
      const removeIcon = document.createElement("img");
      removeIcon.src = "./assets/figma/modal-x.svg";
      removeIcon.alt = "";
      removeButton.append(removeIcon);
      removeButton.addEventListener("click", () => {
        const [removed] = attachedFiles.splice(index, 1);

        if (removed) {
          window.URL.revokeObjectURL(removed.url);
        }

        renderAttachedFiles();
      });

      listItem.append(link, removeButton);
      briefFileList.append(listItem);
    });
  };

  briefOpenButtons.forEach((button) => {
    button.addEventListener("click", () => openModal(briefModal));
  });

  briefCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeModal(briefModal));
  });

  successCloseButtons.forEach((button) => {
    button.addEventListener("click", () => closeModal(successModal));
  });

  briefModal.addEventListener("click", (event) => {
    if (event.target === briefModal) {
      closeModal(briefModal);
    }
  });

  successModal?.addEventListener("click", (event) => {
    if (event.target === successModal) {
      closeModal(successModal);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (successModal?.classList.contains("is-open")) {
      closeModal(successModal);
      return;
    }

    if (briefModal.classList.contains("is-open")) {
      closeModal(briefModal);
    }
  });

  if (briefFileInput) {
    briefFileInput.addEventListener("change", () => {
      const nextFiles = Array.from(briefFileInput.files || []);

      nextFiles.forEach((file) => {
        attachedFiles.push({
          file,
          url: window.URL.createObjectURL(file),
        });
      });

      briefFileInput.value = "";
      renderAttachedFiles();
    });
  }

  briefFormInputs.forEach((input) => {
    input.addEventListener("blur", () => {
      const field = input.closest(".brief-form-field");

      if (!field) {
        return;
      }

      field.classList.toggle("is-invalid", input.validity.valueMissing);
    });

    input.addEventListener("input", () => {
      const field = input.closest(".brief-form-field");

      if (!field) {
        return;
      }

      field.classList.remove("is-invalid");
    });
  });

  briefForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstInvalidInput = null;

    briefFormInputs.forEach((input) => {
      const field = input.closest(".brief-form-field");
      const isInvalid = input.validity.valueMissing;

      field?.classList.toggle("is-invalid", isInvalid);

      if (isInvalid && !firstInvalidInput) {
        firstInvalidInput = input;
      }
    });

    if (firstInvalidInput) {
      firstInvalidInput.focus();
      return;
    }

    const data = new FormData(briefForm);
    const serviceLabels = {
      aquaprint: "Аквапринт",
      antichrome: "Антихром",
      painting: "Покраска",
      restoration: "Реставрация",
      other: "Другое",
    };
    const objectLabels = {
      auto: "Авто",
      moto: "Мото",
      wheels: "Диски",
      interior: "Салон/интерьер",
      other: "Другое",
    };
    const lines = ["Заявка с сайта «Хамелеон»"];
    const service = data.get("service");
    const object = data.get("object");
    if (service) lines.push(`Услуга: ${serviceLabels[service] || service}`);
    if (object) lines.push(`Объект: ${objectLabels[object] || object}`);
    const name = (data.get("name") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const task = (data.get("task") || "").toString().trim();
    if (name) lines.push(`Имя: ${name}`);
    if (contact) lines.push(`Контакт: ${contact}`);
    if (task) lines.push(`Задача: ${task}`);

    const fileCount = briefFileInput?.files?.length || 0;
    if (fileCount > 0) {
      lines.push(`Вложений: ${fileCount} (отправлю следующим сообщением)`);
    }

    const tgUrl = `https://t.me/katerpillar_89?text=${encodeURIComponent(lines.join("\n"))}`;
    try {
      window.open(tgUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      window.location.href = tgUrl;
    }

    closeModal(briefModal);

    window.setTimeout(() => {
      openModal(successModal);
      resetBriefForm();
    }, 220);
  });
}

function initMotionSystem() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = new Set();
  const motionNodes = [];

  const registerMotion = (selector, { kind = "copy", baseDelay = 0, stagger = 80 } = {}) => {
    document.querySelectorAll(selector).forEach((node, index) => {
      if (seen.has(node)) {
        return;
      }

      seen.add(node);
      node.classList.add("motion-reveal");
      node.dataset.motionKind = kind;
      node.style.setProperty("--motion-delay", `${baseDelay + index * stagger}ms`);
      motionNodes.push(node);
    });
  };

  registerMotion(".cover-alt-lead, .cover-alt-cta", {
    kind: "copy",
    baseDelay: 120,
    stagger: 90,
  });
  registerMotion(".hero-title", { kind: "heading", baseDelay: 20 });
  registerMotion(".hero-subtitle", { kind: "copy", baseDelay: 120 });
  registerMotion(".services-title", { kind: "heading" });
  registerMotion(".services-grid > .service-card, .services-grid > .cta-card", {
    kind: "card",
    baseDelay: 40,
    stagger: 70,
  });
  registerMotion(".works-title", { kind: "heading" });
  registerMotion(".works-tabs", { kind: "copy", baseDelay: 60 });
  registerMotion(".works-slider-shell", { kind: "media", baseDelay: 120 });
  registerMotion(".clients-network-copy", { kind: "copy" });
  registerMotion(".clients-network-map", { kind: "media", baseDelay: 80 });
  registerMotion(".clients-network-steps", { kind: "media", baseDelay: 120 });
  registerMotion(".clients-network-cta", { kind: "copy", baseDelay: 180 });
  registerMotion(".store-title", { kind: "heading" });
  registerMotion(".store-toolbar", { kind: "copy", baseDelay: 60 });
  registerMotion(".store-slider-shell", { kind: "media", baseDelay: 120 });
  registerMotion(".choice-head", { kind: "heading" });
  registerMotion(".choice-slider-shell", { kind: "media", baseDelay: 120 });
  registerMotion(".choice-cta", { kind: "copy", baseDelay: 180 });
  registerMotion(".about-title", { kind: "heading" });
  registerMotion(".about-intro", { kind: "copy", baseDelay: 60 });
  registerMotion(".about-telegram", { kind: "copy", baseDelay: 120 });
  registerMotion(".about-stats > .about-stat", {
    kind: "card",
    baseDelay: 80,
    stagger: 70,
  });
  registerMotion(".choice-slider-track > .choice-card", {
    kind: "card",
    baseDelay: 80,
    stagger: 120,
  });
  registerMotion(".testimonials-scroll-title", { kind: "heading" });
  registerMotion(".testimonials-scroll-subtitle", { kind: "copy", baseDelay: 120 });
  registerMotion(".faq-title", { kind: "heading" });
  registerMotion(".faq-item", { kind: "card", baseDelay: 50, stagger: 60 });
  registerMotion(".business-title", { kind: "heading" });
  registerMotion(".business-visual img", { kind: "media", baseDelay: 60 });
  registerMotion(".business-cards > .business-card", {
    kind: "card",
    baseDelay: 90,
    stagger: 70,
  });
  registerMotion(".footer-contact-title", { kind: "heading" });
  registerMotion(".footer-contact-subtitle", { kind: "copy", baseDelay: 120 });
  registerMotion(".footer-contact-hero", { kind: "media", baseDelay: 90 });
  registerMotion(".footer-contact-cards > *", {
    kind: "card",
    baseDelay: 70,
    stagger: 80,
  });
  registerMotion(".footer-contact-meta > *", {
    kind: "copy",
    baseDelay: 120,
    stagger: 70,
  });
  registerMotion(".site-footer-bar", { kind: "copy", baseDelay: 60 });
  if (motionNodes.length === 0) {
    return;
  }

  if (prefersReducedMotion) {
    motionNodes.forEach((node) => node.classList.add("is-in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      // Pre-trigger: the bottom rootMargin EXTENDS the viewport by 18%,
      // so elements start their reveal ~150px BEFORE scrolling into
      // view and land already-visible. (Was -4% — reveal only started
      // once the element was inside the viewport, which combined with
      // the 700-800ms transition + stagger made second-row cards feel
      // like they arrived late.)
      threshold: 0.01,
      rootMargin: "0px 0px 18% 0px",
    }
  );

  motionNodes.forEach((node) => observer.observe(node));
}

function initCoverHeaders() {
  const headerEntries = Array.from(coverHeaders)
    .map((header) => ({
      header,
      burger: header.querySelector(".cover-burger"),
      menu: header.querySelector(".cover-menu"),
    }))
    .filter((entry) => entry.burger && entry.menu);

  if (headerEntries.length === 0) {
    return;
  }

  const closeAllMenus = () => {
    headerEntries.forEach(({ header, burger }) => {
      header.classList.remove("is-menu-open");
      burger.setAttribute("aria-expanded", "false");
    });
  };

  headerEntries.forEach(({ header, burger, menu }) => {
    burger.addEventListener("click", () => {
      const willOpen = !header.classList.contains("is-menu-open");
      closeAllMenus();
      header.classList.toggle("is-menu-open", willOpen);
      burger.setAttribute("aria-expanded", String(willOpen));
    });

    menu.querySelectorAll("button, a").forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= COVER_MENU_BREAKPOINT) {
          header.classList.remove("is-menu-open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > COVER_MENU_BREAKPOINT) {
      return;
    }

    const clickedInsideAnyHeader = Array.from(coverHeaders).some((header) =>
      header.contains(event.target)
    );

    if (!clickedInsideAnyHeader) {
      closeAllMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllMenus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > COVER_MENU_BREAKPOINT) {
      closeAllMenus();
    }
  });
}

function initCoverAltTyping() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getDisplayLength = (word) => word.replaceAll("\n", "").length;
  const getTypedText = (word, length) => {
    if (!word.includes("\n")) {
      return word.slice(0, length);
    }

    const [firstLine, ...otherLines] = word.split("\n");
    const rest = otherLines.join("\n");

    if (length <= firstLine.length) {
      return firstLine.slice(0, length);
    }

    return `${firstLine}\n${rest.slice(0, length - firstLine.length)}`;
  };

  coverAltTypedNodes.forEach((node) => {
    const words = (node.dataset.typedWords || "")
      .split("|")
      .map((word) => word.trim().replaceAll("__BR__", "\n"))
      .filter(Boolean);

    if (words.length === 0) {
      return;
    }

    if (prefersReducedMotion) {
      node.textContent = words[0];
      return;
    }

    let wordIndex = 0;
    let charIndex = getDisplayLength(words[0]);
    let isDeleting = false;
    let paused = false;
    let timer = null;

    const tick = () => {
      if (paused) return;
      const currentWord = words[wordIndex];
      const currentWordLength = getDisplayLength(currentWord);

      node.textContent = getTypedText(currentWord, charIndex);

      let delay = isDeleting ? 46 : 72;

      if (!isDeleting && charIndex < currentWordLength) {
        charIndex += 1;
      } else if (!isDeleting && charIndex === currentWordLength) {
        isDeleting = true;
        delay = 1180;
      } else if (isDeleting && charIndex > 0) {
        charIndex -= 1;
      } else {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 220;
      }

      timer = window.setTimeout(tick, delay);
    };

    node.textContent = words[0];
    timer = window.setTimeout(tick, 980);

    // Click to pause/resume
    const titleEl = node.closest(".cover-alt-title") || node;
    titleEl.style.cursor = "pointer";
    titleEl.title = "Нажмите, чтобы приостановить";
    titleEl.addEventListener("click", () => {
      paused = !paused;
      titleEl.title = paused ? "Нажмите, чтобы продолжить" : "Нажмите, чтобы приостановить";
      if (!paused) {
        node.textContent = getTypedText(words[wordIndex], charIndex);
        timer = window.setTimeout(tick, 220);
      } else if (timer) {
        clearTimeout(timer);
      }
    });
  });
}

function initClientsNetworkReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    clientsSteps.forEach((step) => step.classList.add("is-visible"));
    return;
  }

  clientsStepsList.classList.add("is-reveal-ready");

  const revealSteps = () => {
    clientsSteps.forEach((step) => {
      step.classList.add("is-visible");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealSteps();
        observer.disconnect();
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  observer.observe(clientsStepsList);
}

function initWorksSection() {
  const applyFilter = (filter) => {
    worksTabs.forEach((tab) => {
      const isActive = tab.dataset.filter === filter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    worksSlides.forEach((slide) => {
      const categories = (slide.dataset.categories || "").split(" ");
      slide.hidden = !(filter === "all" || categories.includes(filter));
    });

    worksSliderShell.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  };

  worksTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      applyFilter(tab.dataset.filter || "all");
    });
  });

  initWorksDragScroll();
  applyFilter("all");
}

function initWorksDragScroll() {
  initHorizontalDragScroll(worksSliderShell);
}

function initHorizontalDragScroll(scrollElement) {
  let isPointerDown = false;
  let hasDragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  scrollElement.addEventListener("pointerdown", (event) => {
    const isChoiceDesktop =
      scrollElement === choiceSliderShell && window.innerWidth > 1100;
    const isClientsDesktop =
      scrollElement === clientsStepsList && window.innerWidth > 1100;
    const isStoreDesktop =
      scrollElement === storeSliderShell && window.innerWidth > 1100;

    if (isChoiceDesktop || isClientsDesktop || isStoreDesktop) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const interactiveTarget = event.target.closest(
      "button, a, input, textarea, select, summary, label"
    );

    if (interactiveTarget) {
      return;
    }

    isPointerDown = true;
    hasDragged = false;
    startX = event.clientX;
    startScrollLeft = scrollElement.scrollLeft;
    scrollElement.classList.add("is-dragging");
    scrollElement.style.scrollBehavior = "auto";

    if (typeof scrollElement.setPointerCapture === "function") {
      scrollElement.setPointerCapture(event.pointerId);
    }
  });

  scrollElement.addEventListener("pointermove", (event) => {
    if (!isPointerDown) {
      return;
    }

    const deltaX = event.clientX - startX;

    if (Math.abs(deltaX) > 3) {
      hasDragged = true;
    }

    scrollElement.scrollLeft = startScrollLeft - deltaX;
    event.preventDefault();
  });

  const releaseDrag = (event) => {
    if (event && hasDragged) {
      event.preventDefault();
    }

    isPointerDown = false;
    scrollElement.classList.remove("is-dragging");
  };

  scrollElement.addEventListener("pointerup", releaseDrag);
  scrollElement.addEventListener("pointercancel", releaseDrag);
}

function initMagneticTelegram() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  const icon = aboutTelegramButton.querySelector(".about-telegram-icon");

  if (!icon) {
    return;
  }

  aboutTelegramButton.addEventListener("pointermove", (event) => {
    const bounds = aboutTelegramButton.getBoundingClientRect();
    const offsetX = event.clientX - (bounds.left + bounds.width / 2);
    const offsetY = event.clientY - (bounds.top + bounds.height / 2);
    const moveX = Math.max(Math.min(offsetX / 10, 8), -8);
    const moveY = Math.max(Math.min(offsetY / 10, 8), -8);

    icon.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    aboutTelegramButton.classList.add("is-magnetic-active");
  });

  const resetMagnetic = () => {
    icon.style.transform = "";
    aboutTelegramButton.classList.remove("is-magnetic-active");
  };

  aboutTelegramButton.addEventListener("pointerleave", resetMagnetic);
  aboutTelegramButton.addEventListener("blur", resetMagnetic);
}

function initStoreSection() {
  const applyFilter = (filter) => {
    storeTabs.forEach((tab) => {
      const isActive = tab.dataset.filter === filter;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    storeCards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(" ");
      card.hidden = !(filter === "all" || categories.includes(filter));
    });

    if (storeSliderShell) {
      storeSliderShell.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  };

  storeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      applyFilter(tab.dataset.filter || "all");
    });
  });

  applyFilter("all");
}

function initTestimonialsScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nativeSwipeQuery = window.matchMedia("(max-width: 720px) and (pointer: coarse)");

  if (prefersReducedMotion) {
    testimonialsCardsLayer.style.transform = "translate3d(0px, 0, 0)";
    return;
  }

  let ticking = false;
  let endX = 0;
  let sectionTop = 0;
  let scrollableDistance = 1;

  const recalc = () => {
    // Real touch devices use the native swipe row. A narrow desktop
    // window still keeps the scroll-driven fly-by, and resizing out of
    // mobile mode re-enables it without requiring a page refresh.
    if (nativeSwipeQuery.matches) {
      testimonialsCardsLayer.style.removeProperty("width");
      testimonialsCardsLayer.style.removeProperty("transform");
      ticking = false;
      return;
    }

    const trackWidth = testimonialsCardsLayer.scrollWidth;

    testimonialsCardsLayer.style.width = `${trackWidth}px`;
    sectionTop = testimonialsSection.offsetTop;
    // Cards animate over 60% of the section's scrollable distance;
    // the remaining 40% is a title-only pinned window for the
    // business panel below to overlap.
    const multiplier = 0.6;
    scrollableDistance = Math.max(
      (testimonialsSection.offsetHeight - window.innerHeight) * multiplier,
      1
    );
    endX = -(trackWidth + window.innerWidth * 0.2);
    update();
  };

  const update = () => {
    if (nativeSwipeQuery.matches) {
      ticking = false;
      return;
    }

    const progressed = Math.min(
      Math.max((window.scrollY - sectionTop) / scrollableDistance, 0),
      1
    );
    // Start cards on the right edge so title in center is unobstructed
    const startX = window.innerWidth * 0.75;
    const currentX = startX + (endX - startX) * progressed;

    // Round to integer pixels — sub-pixel translateX makes text
    // inside the cards re-rasterize at slightly different positions
    // each frame, which the eye reads as "shaking" / "wobbling".
    testimonialsCardsLayer.style.transform = `translate3d(${Math.round(currentX)}px, 0, 0)`;
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  };

  recalc();
  window.addEventListener("load", recalc);
  window.addEventListener("resize", recalc);
  window.addEventListener("scroll", requestUpdate, { passive: true });
  nativeSwipeQuery.addEventListener("change", recalc);
}

function initChoiceForcedScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  let ticking = false;
  let sectionTop = 0;
  let scrollableDistance = 1;
  let maxTranslateX = 0;

  const isDesktop = () => window.innerWidth > 1100;

  const recalc = () => {
    if (!choiceSection || !choiceSliderShell || !choiceSliderTrack) {
      return;
    }

    if (!isDesktop()) {
      choiceSection.classList.remove("is-forced-scroll");
      choiceSection.style.height = "";
      choiceSliderTrack.style.transform = "";
      return;
    }

    choiceSection.classList.add("is-forced-scroll");

    maxTranslateX = Math.max(
      choiceSliderTrack.scrollWidth - choiceSliderShell.clientWidth,
      0
    );

    const totalHeight = Math.max(
      window.innerHeight * 2.4,
      window.innerHeight + maxTranslateX + 320
    );
    choiceSection.style.height = `${totalHeight}px`;
    sectionTop = choiceSection.offsetTop;
    scrollableDistance = Math.max(choiceSection.offsetHeight - window.innerHeight, 1);
    update();
  };

  const update = () => {
    if (!choiceSection || !choiceSliderShell || !choiceSliderTrack) {
      ticking = false;
      return;
    }

    if (!isDesktop()) {
      ticking = false;
      return;
    }

    const progressed = Math.min(
      Math.max((window.scrollY - sectionTop) / scrollableDistance, 0),
      1
    );

    choiceSliderTrack.style.transform = `translate3d(${-maxTranslateX * progressed}px, 0, 0)`;
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  };

  recalc();
  window.addEventListener("load", recalc);
  window.addEventListener("resize", recalc);
  window.addEventListener("scroll", requestUpdate, { passive: true });
}

function initCoverCtaSpotlight() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll(".cover-cta").forEach((cta) => {
    cta.addEventListener("pointermove", (event) => {
      const bounds = cta.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      cta.style.setProperty("--cta-spot-x", `${x}%`);
      cta.style.setProperty("--cta-spot-y", `${y}%`);
    });

    cta.addEventListener("pointerleave", () => {
      cta.style.setProperty("--cta-spot-x", "50%");
      cta.style.setProperty("--cta-spot-y", "50%");
    });
  });
}

function initMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  if (!menu) return;

  const burgers = document.querySelectorAll(".cover-burger");
  if (burgers.length === 0) return;

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    menu.hidden = false;
    // Force a synchronous reflow so the browser registers the
    // hidden=false → display change before .is-open flips opacity —
    // that's what makes the fade-in transition run. Was a
    // requestAnimationFrame callback, which could be throttled (or
    // skipped) on background tabs / slow devices and leave the menu
    // stuck half-open. A forced reflow is deterministic.
    void menu.offsetWidth;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-mobile-menu-open");
    menu.querySelector(".mobile-menu-close")?.focus();
  };

  const close = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-mobile-menu-open");
    setTimeout(() => {
      menu.hidden = true;
      lastFocused?.focus?.();
    }, 280);
  };

  burgers.forEach((burger) => {
    burger.addEventListener("click", (e) => {
      // On mobile take over from the legacy dropdown
      if (window.innerWidth <= 720) {
        e.preventDefault();
        e.stopImmediatePropagation();
        open();
      }
    }, true);
  });

  menu.querySelectorAll("[data-mobile-menu-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  menu.querySelectorAll("[data-mobile-menu-link]").forEach((el) => {
    el.addEventListener("click", () => close());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) close();
  });
}

function initStoreDetailModal() {
  const modal = document.querySelector("[data-store-detail-modal]");
  if (!modal) return;
  const dialog = modal.querySelector(".store-detail-modal-dialog");
  const titleEl = modal.querySelector("[data-store-detail-title]");
  const descEl = modal.querySelector("[data-store-detail-description]");
  const priceEl = modal.querySelector("[data-store-detail-price]");
  const imgEl = modal.querySelector("[data-store-detail-image]");
  let lastFocused = null;

  const open = (data) => {
    titleEl.textContent = data.title || "";
    descEl.textContent = data.description || "";
    priceEl.textContent = data.price || "";
    if (data.image) {
      imgEl.src = data.image;
      imgEl.alt = data.title || "";
      imgEl.parentElement.hidden = false;
    } else {
      imgEl.parentElement.hidden = true;
    }
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-store-detail-open");
    });
    dialog.querySelector(".store-detail-modal-close")?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-store-detail-open");
    setTimeout(() => {
      modal.hidden = true;
      lastFocused?.focus?.();
    }, 280);
  };

  document.querySelectorAll("[data-store-detail]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      open({
        title: btn.dataset.title,
        description: btn.dataset.description,
        price: btn.dataset.price,
        image: btn.dataset.image,
      });
    });
  });

  modal.querySelectorAll("[data-store-detail-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

function initFaq() {
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) {
        return;
      }

      faqItems.forEach((faqItem) => {
        if (faqItem !== item) {
          faqItem.open = false;
        }
      });
    });
  });
}
