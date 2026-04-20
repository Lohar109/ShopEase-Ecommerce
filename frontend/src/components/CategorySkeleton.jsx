import React from "react";

const CategorySkeleton = () => {
  return (
    <div
      className="shop-category-card category-skeleton-card rounded-lg border-zinc-200"
      aria-hidden="true"
    >
      <span className="category-skeleton-icon bg-zinc-200 animate-pulse" />
      <span className="category-skeleton-divider bg-zinc-200 animate-pulse" />
      <span className="category-skeleton-text rounded-lg bg-zinc-200 animate-pulse" />
    </div>
  );
};

export default CategorySkeleton;
