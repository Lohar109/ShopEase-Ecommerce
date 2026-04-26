import React, { useEffect, useMemo, useState } from "react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const CategoryNav = () => {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/categories`)
      .then((response) => response.json())
      .then((data) => setAllCategories(Array.isArray(data) ? data : []))
      .catch(() => setAllCategories([]));
  }, []);

  const categories = useMemo(
    () => allCategories.filter((category) => category?.parent_id === null),
    [allCategories]
  );

  return (
    <section className="category-nav-shell bg-white border-b border-zinc-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden whitespace-nowrap" aria-label="Premium category navigation">
      <div className="category-nav-primary-row flex w-fit animate-marquee hover:[animation-play-state:paused] py-2" role="list" aria-label="Primary categories">
        {[...categories, ...categories].map((category, index) => {
          return (
            <div key={`${category._id || category.name}-${index}`} className="flex flex-col items-center justify-start gap-1 cursor-pointer group min-w-[100px] transition-all duration-300 ease-in-out px-4">
              <img
                src={`/category-icons/${category.name}.png`}
                alt={category.name}
                className="w-7 h-7 object-contain group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-300 ease-in-out"
              />
              <span className="text-center text-xs font-medium text-zinc-800 whitespace-nowrap group-hover:text-[#c8507a] transition-all duration-300 ease-in-out">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryNav;
