import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Laptop,
  Shirt,
  HeartPulse,
  Home,
  Dumbbell,
  Baby,
  LayoutGrid
} from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const iconMap = {
  "Beauty & Personal Care": Sparkles,
  "Books & Stationery": BookOpen,
  Electronics: Laptop,
  Fashion: Shirt,
  "Health & Wellness": HeartPulse,
  "Home & Kitchen": Home,
  "Sports & Fitness": Dumbbell,
  "Toys & Baby Care": Baby
};

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
          const IconComponent = iconMap[category.name] || LayoutGrid;
          return (
            <div key={category._id || category.name} className="flex flex-row items-center gap-2 cursor-pointer group">
              <IconComponent className="w-6 h-6 text-zinc-800 group-hover:text-[#c8507a] transition-colors" strokeWidth={1.5} />
              <span className="text-zinc-900 font-medium text-sm group-hover:text-[#c8507a] transition-colors whitespace-nowrap">
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
