import React from "react";

const CategorySkeleton = () => {
  return (
    <section
      className="category-nav-shell bg-white border-b border-zinc-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
      aria-label="Loading categories"
      aria-hidden="true"
    >
      <div className="overflow-hidden whitespace-nowrap">
        <div className="flex flex-nowrap gap-0 py-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-start gap-2 min-w-[100px] px-4"
            >
              {/* Icon skeleton */}
              <div className="w-8 h-8 rounded-full bg-zinc-200 category-skel-pulse" />
              {/* Label skeleton */}
              <div className="w-14 h-2.5 rounded-full bg-zinc-200 category-skel-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySkeleton;
