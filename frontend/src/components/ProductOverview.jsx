import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Dynamic Icon component to render dynamic icon based on database string
 */
const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
};

const ProductOverview = ({ overview }) => {
  // Safe guard against null prop
  if (!overview || !overview.intro) {
    return null;
  }

  const { intro } = overview;
  const bullets = intro.bullets || [];
  const useCases = Array.isArray(overview.use_cases) ? overview.use_cases : [];

  return (
    <div className="product-overview-root w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      
      {/* Top Layout: 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16 md:mb-24">
        
        {/* Left Column: Intro Details (col-span-4) */}
        <div className="flex flex-col lg:col-span-4 text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            {intro.heading}
          </h2>
          
          <p className="text-base md:text-lg text-gray-500 leading-relaxed mb-8">
            {intro.description}
          </p>

          {/* Highlights List (list-none format) */}
          {bullets.length > 0 && (
            <div className="flex flex-col gap-4" aria-label="Key highlights">
              {bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1">
                  <DynamicIcon 
                    name={bullet.icon} 
                    className="w-5 h-5 text-gray-400 stroke-[2]" 
                  />
                  <span className="text-base font-semibold text-gray-700 tracking-tight antialiased">
                    {bullet.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Use Case Gallery (col-span-8) */}
        <div className="lg:col-span-8 w-full overflow-hidden">
          {useCases.length > 0 ? (
            <div className="flex flex-row overflow-x-auto gap-6 pb-6 scroll-smooth snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
              {useCases.map((item, idx) => {
                // Extract imageUrl: supports string array or object array
                const imageUrl = typeof item === 'string' ? item : (item?.image || '');
                if (!imageUrl) return null;

                return (
                  <div 
                    key={idx} 
                    className="min-w-[280px] md:min-w-[340px] flex-shrink-0 rounded-3xl overflow-hidden aspect-[4/5] bg-gray-50 border border-gray-100 shadow-sm transition-all duration-300 snap-start group relative"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Use Case Visualization ${idx + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full min-h-[360px] bg-gray-50 rounded-3xl flex flex-col items-center justify-center border border-gray-100 text-center p-8">
              <div className="flex flex-col items-center gap-3 text-gray-400 max-w-xs">
                <Icons.Image className="w-10 h-10 stroke-[1.25]" />
                <p className="text-sm font-bold tracking-wide uppercase text-[11px]">Use Cases Pending</p>
                <p className="text-xs text-gray-400 leading-normal">Configure image assets in your dashboard to populate this interactive gallery.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Layout: 4-Column Grid for Remaining Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-gray-100 pt-12">
        
        {/* Specifications Card */}
        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Icons.Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Specifications</h3>
          </div>
          <div className="h-24 flex items-center justify-center border-dashed border border-gray-200 rounded-xl bg-gray-50/30">
            <span className="text-xs text-gray-400 font-medium">Details pending</span>
          </div>
        </div>

        {/* What's in the Box Card */}
        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Icons.Package className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">What's in the Box</h3>
          </div>
          <div className="h-24 flex items-center justify-center border-dashed border border-gray-200 rounded-xl bg-gray-50/30">
            <span className="text-xs text-gray-400 font-medium">Details pending</span>
          </div>
        </div>

        {/* Perfect For Card */}
        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Icons.Compass className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Perfect For</h3>
          </div>
          <div className="h-24 flex items-center justify-center border-dashed border border-gray-200 rounded-xl bg-gray-50/30">
            <span className="text-xs text-gray-400 font-medium">Details pending</span>
          </div>
        </div>

        {/* Why You'll Love It Card */}
        <div className="bg-white border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-lg bg-pink-50 text-pink-600">
              <Icons.Heart className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">Why You'll Love It</h3>
          </div>
          <div className="h-24 flex items-center justify-center border-dashed border border-gray-200 rounded-xl bg-gray-50/30">
            <span className="text-xs text-gray-400 font-medium">Details pending</span>
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default ProductOverview;
