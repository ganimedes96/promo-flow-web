"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { featureCategories, featureSlides } from "./feature-slides";
import { FeatureDemo } from "./feature-demo";
import styles from "./feature-carousel.module.css";
export function FeatureCarousel({
  scrollIndex,
  onNavigate,
}: {
  scrollIndex?: number;
  onNavigate?: (index: number) => void;
}) {
  const scrollDriven = scrollIndex !== undefined;
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [automatic, setAutomatic] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const categoryIndex = featureSlides[selected].category;
  const category = featureCategories[categoryIndex];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.2 }
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!api) return;
    const select = () => setSelected(api.selectedScrollSnap());
    const interact = () => setAutomatic(false);
    select();
    api.on("select", select);
    api.on("reInit", select);
    api.on("pointerDown", interact);
    return () => {
      api.off("select", select);
      api.off("reInit", select);
      api.off("pointerDown", interact);
    };
  }, [api]);
  useEffect(() => {
    if (
      !api ||
      !automatic ||
      hovered ||
      focused ||
      !visible ||
      reduced ||
      scrollDriven
    )
      return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
      }
    }, 6500);
    return () => clearInterval(timer);
  }, [
    api,
    automatic,
    hovered,
    focused,
    visible,
    reduced,
    selected,
    scrollDriven,
  ]);
  useEffect(() => {
    if (api && scrollIndex !== undefined) api.scrollTo(scrollIndex, reduced);
  }, [api, scrollIndex, reduced]);
  const navigate = (index: number) => {
    setAutomatic(false);
    if (onNavigate) onNavigate(index);
    else api?.scrollTo(index, reduced);
  };
  return (
    <div
      ref={root}
      className={styles.showcase}
      data-scroll-driven={scrollDriven}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div
        className={styles.categoryNav}
        role="group"
        aria-label="Etapas do PromoFlow"
      >
        {featureCategories.map((item, index) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={categoryIndex === index}
            onClick={() =>
              navigate(
                featureSlides.findIndex((slide) => slide.category === index)
              )
            }
          >
            <small>0{index + 1}</small>
            {item.title}
          </button>
        ))}
      </div>
      <div className={styles.layout}>
        <aside className={styles.summary} key={category.title}>
          <span className={styles.bigNumber}>0{categoryIndex + 1}</span>
          <h3>{category.title}</h3>
          <p>{category.description}</p>
          <ul>
            {category.points.map((point) => (
              <li key={point}>
                <Check size={15} />
                {point}
              </li>
            ))}
          </ul>
          <span className={styles.summaryFoot}>DO ACHADO AO SEU GRUPO ↗</span>
        </aside>
        <div className={styles.carouselArea}>
          <Carousel
            opts={{
              align: "start",
              containScroll: false,
              duration: 35,
              watchDrag: !scrollDriven,
            }}
            setApi={setApi}
            className={styles.carousel}
            aria-label="Funcionalidades do PromoFlow"
          >
            <CarouselContent className={styles.track}>
              {featureSlides.map((slide, index) => (
                <CarouselItem key={slide.kind} className={styles.slide}>
                  <article
                    className={styles.featureCard}
                    data-active={selected === index}
                  >
                    <div className={styles.demo}>
                      <FeatureDemo kind={slide.kind} />
                      <span className={styles.demoLabel}>
                        PRÉVIA ILUSTRATIVA
                      </span>
                    </div>
                    <div className={styles.copy}>
                      <span className={styles.eyebrow}>{slide.eyebrow}</span>
                      <h3>{slide.title}</h3>
                      <p>{slide.text}</p>
                      <div className={styles.tags}>
                        {slide.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className={styles.controls}>
            <div
              className={styles.progress}
              role="progressbar"
              aria-label="Progresso dos recursos"
              aria-valuemin={1}
              aria-valuemax={featureSlides.length}
              aria-valuenow={selected + 1}
            >
              <span
                style={{
                  width: `${((selected + 1) / featureSlides.length) * 100}%`,
                }}
              />
            </div>
            <span className={styles.counter}>
              {selected + 1} / {featureSlides.length}
            </span>
            <div className={styles.arrows}>
              <button
                type="button"
                aria-label="Recurso anterior"
                disabled={selected === 0}
                onClick={() => navigate(selected - 1)}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Próximo recurso"
                disabled={selected === featureSlides.length - 1}
                onClick={() => navigate(selected + 1)}
              >
                <ArrowRight size={18} />
              </button>
              {!scrollDriven && (
                <button
                  type="button"
                  disabled={reduced}
                  aria-label={
                    automatic
                      ? "Pausar reprodução automática"
                      : "Reproduzir automaticamente"
                  }
                  aria-pressed={automatic && !reduced}
                  onClick={() => setAutomatic((value) => !value)}
                >
                  {automatic && !reduced ? (
                    <Pause size={15} />
                  ) : (
                    <Play size={15} />
                  )}
                </button>
              )}
            </div>
          </div>
          <p className={styles.hint}>
            {scrollDriven
              ? "Continue rolando para explorar os recursos. Ao final, a página segue normalmente."
              : "Arraste para explorar ou use as setas. Você revisa cada oferta antes de agendar."}
          </p>
        </div>
      </div>
    </div>
  );
}
