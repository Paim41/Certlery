"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export function SiteEffects() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector<HTMLElement>(".site-header");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const tiltItems = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const magneticItems = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const rippleItems = Array.from(document.querySelectorAll<HTMLElement>("[data-ripple]"));
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    let previousScroll = window.scrollY;
    let animationFrame = 0;

    const onPointerMove = (event: PointerEvent) => {
      root.style.setProperty("--mouse-x", `${event.clientX}px`);
      root.style.setProperty("--mouse-y", `${event.clientY}px`);
    };

    const onScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll-progress", `${max > 0 ? (current / max) * 100 : 0}%`);
        header?.classList.toggle("is-scrolled", current > 24);
        header?.classList.toggle("nav-hidden", current > previousScroll && current > 150);
        setShowBackToTop(current > 600);
        previousScroll = current;
        animationFrame = 0;
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.16 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const target = Number(element.dataset.count ?? 0);
          const suffix = element.dataset.suffix ?? "";
          const duration = 1200;
          const startedAt = performance.now();
          const update = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = `${Math.round(target * eased)}${suffix}`;
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
          counterObserver.unobserve(element);
        });
      },
      { threshold: 0.55 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));

    const cleanupTilt = tiltItems.map((item) => {
      const move = (event: PointerEvent) => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        item.style.setProperty("--tilt-x", `${y * -8}deg`);
        item.style.setProperty("--tilt-y", `${x * 9}deg`);
        item.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
      };
      const leave = () => {
        item.style.setProperty("--tilt-x", "0deg");
        item.style.setProperty("--tilt-y", "0deg");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return () => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      };
    });

    const cleanupMagnetic = magneticItems.map((item) => {
      const move = (event: PointerEvent) => {
        const rect = item.getBoundingClientRect();
        item.style.setProperty("--magnetic-x", `${(event.clientX - rect.left - rect.width / 2) * 0.16}px`);
        item.style.setProperty("--magnetic-y", `${(event.clientY - rect.top - rect.height / 2) * 0.16}px`);
      };
      const leave = () => {
        item.style.setProperty("--magnetic-x", "0px");
        item.style.setProperty("--magnetic-y", "0px");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return () => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      };
    });

    const cleanupRipples = rippleItems.map((item) => {
      const click = (event: MouseEvent) => {
        const rect = item.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "button-ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        item.append(ripple);
        window.setTimeout(() => ripple.remove(), 650);
      };
      item.addEventListener("click", click);
      return () => item.removeEventListener("click", click);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          document.querySelectorAll(".desktop-nav a").forEach((link) => {
            const anchor = link as HTMLAnchorElement;
            anchor.classList.toggle("active", anchor.hash === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.forEach((section) => sectionObserver.observe(section));

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      counterObserver.disconnect();
      sectionObserver.disconnect();
      cleanupTilt.forEach((cleanup) => cleanup());
      cleanupMagnetic.forEach((cleanup) => cleanup());
      cleanupRipples.forEach((cleanup) => cleanup());
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <button
        className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </>
  );
}
