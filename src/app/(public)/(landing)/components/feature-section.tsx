"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FeatureCarousel } from "./feature-carousel";
import { featureSlides } from "./feature-slides";
import styles from "./feature-section.module.css";
export function FeatureSection() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pinned, setPinned] = useState(false);
  const [index, setIndex] = useState(0);
  const [top, setTop] = useState(80);
  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)"
    );
    const update = () => {
      setPinned(media.matches);
      setTop(
        document.querySelector(".flow-nav")?.getBoundingClientRect().height ??
          80
      );
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!section.current) return;
      const range = section.current.offsetHeight - (window.innerHeight - top);
      const progress = Math.max(
        0,
        Math.min(
          1,
          (top - section.current.getBoundingClientRect().top) /
            Math.max(1, range)
        )
      );
      setIndex(Math.round(progress * (featureSlides.length - 1)));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [pinned, top]);
  useEffect(()=>{
    if(!pinned || !content.current)return;
    const element=content.current;
    const measure=()=>setScale(Math.min(1,(window.innerHeight-top-20)/Math.max(1,element.offsetHeight)));
    const observer=new ResizeObserver(measure);observer.observe(element);measure();
    window.addEventListener('resize',measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[pinned,top]);
  const navigate = (next: number) => {
    if (!section.current) return;
    const range = section.current.offsetHeight - (window.innerHeight - top);
    const start =
      window.scrollY + section.current.getBoundingClientRect().top - top;
    window.scrollTo({
      top: start + (next / (featureSlides.length - 1)) * range,
      behavior: "smooth",
    });
  };
  return (
    <section
      id="recursos"
      ref={section}
      className={`flow-resources-section ${styles.section} ${pinned ? styles.pinned : ""}`}
      style={
        {
          "--feature-sticky-top": `${top}px`,
          "--feature-scale": scale,
          "--feature-scroll-range": `${(featureSlides.length - 1) * 420}px`,
        } as CSSProperties
      }
    >
      <div className={styles.sticky}>
        <div ref={content} className={styles.frame}>
          <div className={`flow-resources-heading ${styles.heading}`}>
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                MENOS ABAS. MAIS POSSIBILIDADES.
              </p>
              <h2 className="mt-4 max-w-xl text-3xl sm:text-4xl">
                Seu trabalho,
                <br />
                <span>em um só fluxo.</span>
              </h2>
            </div>
            <p>
              As ferramentas certas para cada etapa. Da captura ao histórico,
              sem perder o fio da oferta.
            </p>
          </div>
          <FeatureCarousel
            scrollIndex={pinned ? index : undefined}
            onNavigate={pinned ? navigate : undefined}
          />
        </div>
      </div>
    </section>
  );
}
