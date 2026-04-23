import React, { useState } from "react";
import {
  BedDouble,
  BookOpen,
  Camera,
  Dice5,
  Dumbbell,
  Footprints,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  TabletSmartphone,
  Tv,
  Volleyball,
  Watch
} from "lucide-react";

const categories = [
  {
    key: "electronics",
    label: "Electronics",
    icon: Monitor,
    subcategories: [
      { key: "laptops", label: "Laptops", icon: Laptop },
      { key: "wearables", label: "Wearables", icon: Watch },
      { key: "audio", label: "Audio", icon: Headphones },
      { key: "cameras", label: "Cameras", icon: Camera },
      { key: "tablets", label: "Tablets", icon: TabletSmartphone }
    ]
  },
  {
    key: "fashion",
    label: "Fashion",
    icon: Shirt,
    subcategories: [
      { key: "men", label: "Men", icon: Shirt },
      { key: "shoes", label: "Shoes", icon: Footprints },
      { key: "watches", label: "Watches", icon: Watch },
      { key: "beauty", label: "Beauty", icon: Sparkles }
    ]
  },
  {
    key: "mobiles",
    label: "Mobiles",
    icon: Smartphone,
    subcategories: [
      { key: "smartphones", label: "Smartphones", icon: Smartphone },
      { key: "accessories", label: "Accessories", icon: Headphones },
      { key: "tablets", label: "Tablets", icon: TabletSmartphone },
      { key: "smart-tv", label: "Smart TV", icon: Tv }
    ]
  },
  {
    key: "home",
    label: "Home",
    icon: Sofa,
    subcategories: [
      { key: "furniture", label: "Furniture", icon: BedDouble },
      { key: "living-room", label: "Living Room", icon: Sofa },
      { key: "decor", label: "Decor", icon: Sparkles },
      { key: "kitchen", label: "Kitchen", icon: ShoppingBasket }
    ]
  },
  {
    key: "sports",
    label: "Sports",
    icon: Volleyball,
    subcategories: [
      { key: "fitness", label: "Fitness", icon: Dumbbell },
      { key: "outdoor", label: "Outdoor", icon: Volleyball },
      { key: "footwear", label: "Footwear", icon: Footprints },
      { key: "gear", label: "Gear", icon: Gamepad2 }
    ]
  },
  {
    key: "beauty",
    label: "Beauty",
    icon: Sparkles,
    subcategories: [
      { key: "skincare", label: "Skincare", icon: Sparkles },
      { key: "grooming", label: "Grooming", icon: Shirt },
      { key: "fragrance", label: "Fragrance", icon: Sparkles },
      { key: "wellness", label: "Wellness", icon: Dumbbell }
    ]
  },
  {
    key: "books",
    label: "Books",
    icon: BookOpen,
    subcategories: [
      { key: "fiction", label: "Fiction", icon: BookOpen },
      { key: "business", label: "Business", icon: BookOpen },
      { key: "learning", label: "Learning", icon: Laptop },
      { key: "kids", label: "Kids", icon: Dice5 }
    ]
  },
  {
    key: "toys",
    label: "Toys",
    icon: Dice5,
    subcategories: [
      { key: "games", label: "Games", icon: Gamepad2 },
      { key: "learning", label: "Learning", icon: BookOpen },
      { key: "outdoor", label: "Outdoor", icon: Volleyball },
      { key: "collectibles", label: "Collectibles", icon: Sparkles }
    ]
  },
  {
    key: "groceries",
    label: "Groceries",
    icon: ShoppingBasket,
    subcategories: [
      { key: "staples", label: "Staples", icon: ShoppingBasket },
      { key: "snacks", label: "Snacks", icon: ShoppingBasket },
      { key: "personal-care", label: "Personal Care", icon: Sparkles },
      { key: "household", label: "Household", icon: Sofa }
    ]
  },
  {
    key: "furniture",
    label: "Furniture",
    icon: BedDouble,
    subcategories: [
      { key: "beds", label: "Beds", icon: BedDouble },
      { key: "sofas", label: "Sofas", icon: Sofa },
      { key: "storage", label: "Storage", icon: ShoppingBasket },
      { key: "workspaces", label: "Workspaces", icon: Laptop }
    ]
  }
];

const CategoryNav = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const activeCategoryData = categories.find((category) => category.key === activeCategory);

  return (
    <section className="category-nav-shell" aria-label="Premium category navigation">
      <div className="category-nav-primary-row" role="list" aria-label="Primary categories">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              className={`category-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setActiveCategory((current) => current === category.key ? null : category.key)}
              aria-expanded={isActive}
              aria-controls="category-nav-subcategories"
            >
              <span className="category-nav-icon-box" aria-hidden="true">
                <Icon size={24} strokeWidth={1.9} />
              </span>
              <span className="category-nav-label">{category.label}</span>
            </button>
          );
        })}
      </div>

      <div
        id="category-nav-subcategories"
        className={`category-nav-subcategory-wrap ${activeCategoryData ? "expanded" : ""}`}
        aria-hidden={!activeCategoryData}
      >
        <div className="category-nav-subcategory-row" role="list" aria-label="Subcategories">
          {activeCategoryData?.subcategories.map((subcategory) => {
            const Icon = subcategory.icon;

            return (
              <button key={subcategory.key} type="button" className="category-nav-subitem">
                <span className="category-nav-subicon-box" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <span className="category-nav-sublabel">{subcategory.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
