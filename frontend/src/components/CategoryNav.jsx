import React, { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  BookOpen,
  Dumbbell,
  Dice5,
  Footprints,
  Home,
  LayoutGrid,
  Laptop,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Volleyball,
  Watch
} from "lucide-react";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const iconMap = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  sports: Volleyball,
  beauty: Sparkles,
  books: BookOpen,
  toys: Dice5,
  mobiles: Smartphone,
  shoes: Footprints,
  groceries: ShoppingBasket,
  furniture: BedDouble,
  watches: Watch,
  fitness: Dumbbell
};

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch(`${API_ORIGIN}/api/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const parentCategories = useMemo(
    () => categories.filter((category) => category?.parent_id === null),
    [categories]
  );

  return (
    <section className="category-nav-shell" aria-label="Premium category navigation">
      <div className="category-nav-primary-row" role="list" aria-label="Primary categories">
        {parentCategories.map((category) => {
          const categoryName = String(category?.name || "Category").trim();
          const Icon = iconMap[categoryName.toLowerCase()] || LayoutGrid;
          const isActive = String(activeCategory) === String(category?.id);

          return (
            <button
              key={category.id}
              type="button"
              className={`category-nav-item ${isActive ? "active" : ""}`}
              onClick={() =>
                setActiveCategory((current) =>
                  String(current) === String(category.id) ? null : category.id
                )
              }
              aria-pressed={isActive}
            >
              <span className="category-nav-icon-box" aria-hidden="true">
                <Icon size={14} strokeWidth={1.9} />
              </span>
              <span className="category-nav-label">{categoryName}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryNav;
