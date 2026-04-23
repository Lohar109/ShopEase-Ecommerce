import React, { useEffect, useState } from "react";

const HERO_SLIDES = [
  {
    id: "fashion-fest",
    imageUrl:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1920&q=80",
    title: "Fashion Fest Live - Styles You Will Love",
    ctaText: "Explore Fashion"
  },
  {
    id: "electronics-rush",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1920&q=80",
    title: "Smart Electronics Deals Up to 40% Off",
    ctaText: "Shop Electronics"
  },
  {
    id: "home-appliances",
    imageUrl:
      "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=1920&q=80",
    title: "Premium Appliances for Every Home",
    ctaText: "View Appliances"
  },
  {
    id: "beauty-edit",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&q=80",
    title: "Beauty Edit - Glow Kits and Essentials",
    ctaText: "Shop Beauty"
  },
  {
    id: "sports-mode",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80",
    title: "Sports and Fitness Gear for Daily Performance",
    ctaText: "Shop Sports"
  },
  {
    id: "gaming-zone",
    imageUrl:
      "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1920&q=80",
    title: "Gaming and Entertainment Specials",
    ctaText: "Enter Gaming Zone"
  },
  {
    id: "kitchen-picks",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1920&q=80",
    title: "Kitchen Picks with Limited-Time Savings",
    ctaText: "Discover Kitchen"
  }
];

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, 3500);

    return () => clearInterval(intervalId);
  }, []);

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % HERO_SLIDES.length);
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="hero-slider-wrap" aria-label="Hero promotions">
      <div className="hero-slider-container w-full rounded-xl overflow-hidden relative group">
        <div
          className="hero-slider-track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <article key={slide.id} className="hero-slider-slide">
              <img src={slide.imageUrl} alt={slide.title} loading="lazy" />
              <div className="hero-slider-overlay" aria-hidden="true" />
              <div className="hero-slider-content">
                <h1>{slide.title}</h1>
                <a href="/shop" className="hero-slider-cta">
                  {slide.ctaText}
                </a>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="hero-slider-arrow hero-slider-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous slide"
        >
          &#8249;
        </button>
        <button
          type="button"
          className="hero-slider-arrow hero-slider-arrow-right"
          onClick={goToNext}
          aria-label="Next slide"
        >
          &#8250;
        </button>

        <div className="hero-slider-dots" role="tablist" aria-label="Slide indicators">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-slider-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
