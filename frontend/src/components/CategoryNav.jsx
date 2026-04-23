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
    <section className="category-nav-shell" aria-label="Premium category navigation">
      <div className="category-nav-primary-row" role="list" aria-label="Primary categories">
        {categories.map((category) => {
          return (
            <div key={category._id || category.name} className="flex flex-row items-center gap-2 cursor-pointer group">
              <img
                src={`/category-icons/${category.name}.png`}
                alt={category.name}
                className="w-10 h-10 object-contain"
              />
              <span className="text-zinc-900 font-medium text-xs group-hover:text-[#c8507a] transition-colors whitespace-nowrap">
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
