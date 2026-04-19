import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HERO_BANNERS = [
  {
    id: "electronics-sale",
    title: "Mega Electronics Sale - Up to 40% Off",
    subtitle: "Limited Time Deal",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80",
    alt: "Modern electronics setup with laptop, headphones, and smart gadgets"
  },
  {
    id: "fashion-arrivals",
    title: "Fresh Fashion Arrivals - Explore Now",
    subtitle: "Just Dropped",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80",
    alt: "Contemporary fashion clothing arranged in a boutique"
  },
  {
    id: "home-essentials",
    title: "Home Essentials - Starting at ₹999",
    subtitle: "Best Value Picks",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1920&q=80",
    alt: "Stylish home interior with sofa, table, and decor"
  }
];

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % HERO_BANNERS.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePrevious = () => {
    setActiveIndex((previous) =>
      previous === 0 ? HERO_BANNERS.length - 1 : previous - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((previous) => (previous + 1) % HERO_BANNERS.length);
  };

  return (
    <section className="hero-carousel" aria-label="Promotional banners">
      <div
        className="hero-carousel-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {HERO_BANNERS.map((banner) => (
          <article key={banner.id} className="hero-carousel-slide">
            <img src={banner.image} alt={banner.alt} loading="lazy" />
            <div className="hero-carousel-overlay" aria-hidden="true" />
            <div className="hero-carousel-content">
              <p className="hero-carousel-subtitle">{banner.subtitle}</p>
              <h1>{banner.title}</h1>
              <a href="/shop" className="hero-carousel-cta">
                Shop Now
              </a>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="hero-carousel-arrow hero-carousel-arrow-left"
        onClick={handlePrevious}
        aria-label="Previous banner"
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      <button
        type="button"
        className="hero-carousel-arrow hero-carousel-arrow-right"
        onClick={handleNext}
        aria-label="Next banner"
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>

      <div className="hero-carousel-dots" role="tablist" aria-label="Banner pagination">
        {HERO_BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-label={`Go to ${banner.title}`}
            aria-selected={activeIndex === index}
            className={`hero-carousel-dot ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
