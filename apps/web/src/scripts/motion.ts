import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power2.out";
const DUR = 0.9;
const Y = 20;

const fade = (o: gsap.TweenVars = {}): gsap.TweenVars => ({
  y: Y,
  opacity: 0,
  duration: DUR,
  ease: EASE,
  ...o,
});

const sc = (el: Element, start = "top 95%"): ScrollTrigger.Vars => ({
  trigger: el,
  start,
  once: true,
});

interface MotionOptions {
  page: "splash" | "resources";
}

export function setupMotion({ page }: MotionOptions) {
  // ── data-animate="hero" — load-time cascade ─────────────────────────────
  const heroSection = document.querySelector('[data-animate="hero"]');
  if (heroSection) {
    const h1 = heroSection.querySelector("h1");
    const p = heroSection.querySelector("p");
    const links = heroSection.querySelectorAll("a");
    const img = heroSection.querySelector("img, div[style*='aspect']");
    if (h1) gsap.from(h1, fade({ duration: 1.1, delay: 0.2 }));
    if (p) gsap.from(p, fade({ delay: 0.5 }));
    if (links.length) {
      gsap.from(
        links,
        fade({
          delay: 0.35,
          duration: 0.6,
          stagger: 0.08,
          overwrite: "auto",
          clearProps: "opacity,transform",
        }),
      );
      gsap.delayedCall(1.5, () =>
        gsap.set(links, { clearProps: "opacity,visibility,transform" }),
      );
    }
    if (img) gsap.from(img, fade({ delay: 0.35 }));
  }

  // ── data-animate="stat" — stat section entrance + count-up ──────────────
  const statSection = document.querySelector('[data-animate="stat"]');
  if (statSection) {
    const statItems = statSection.querySelectorAll("[data-stat-content]");
    if (statItems.length) {
      gsap.from(statItems, {
        x: -16,
        opacity: 0,
        duration: DUR,
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: { trigger: statSection, start: "top bottom", once: true },
      });
    }
    statSection.querySelectorAll(".stat-value").forEach((el) => {
      const num = parseInt(el.textContent ?? "");
      if (!isNaN(num) && num > 1) {
        const proxy = { val: 0 };
        const snap = el.textContent;
        gsap.to(proxy, {
          val: num,
          duration: 2,
          ease: EASE,
          onUpdate() {
            el.textContent = String(Math.round(proxy.val));
          },
          onComplete() {
            el.textContent = snap;
          },
          scrollTrigger: { trigger: statSection, start: "top bottom", once: true },
        });
      }
    });
  }

  // ── data-animate-group — staggered children (runs first) ────────────────
  document.querySelectorAll("[data-animate-group]").forEach((group) => {
    const children = group.querySelectorAll('[data-animate="fade"]');
    if (children.length) {
      gsap.from(children, {
        ...fade({ stagger: 0.1 }),
        scrollTrigger: sc(group),
      });
    }
  });

  // ── data-animate="fade" — generic scroll-triggered fade-up ──────────────
  // Skip elements already handled by a data-animate-group parent.
  document.querySelectorAll('[data-animate="fade"]').forEach((el) => {
    if (el.closest("[data-animate-group]")) return;
    gsap.from(el, { ...fade(), scrollTrigger: sc(el) });
  });

  // ── data-animate="sweep" — yellow marker highlight sweep ─────────────────
  document.querySelectorAll("mark").forEach((el) => {
    gsap.to(el, {
      backgroundSize: "100% 100%",
      duration: 0.8,
      ease: EASE,
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
}
