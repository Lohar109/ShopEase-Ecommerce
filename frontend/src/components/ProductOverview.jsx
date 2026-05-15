import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Dynamic Icon component to render dynamic icon based on database string
 */
const DynamicIcon = ({ name, className }) => {
  // Dynamic icon resolver: matches Lucide icon key, defaults to Sparkles
  const IconComponent = Icons[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
};

const ProductOverview = ({ overview }) => {
  // Safe check to ensure component doesn't crash if overview or intro structure is not populated
  if (!overview || !overview.intro) {
    return null;
  }

  const { intro } = overview;
  const bullets = intro.bullets || [];

  return (
    <div className="product-overview-root w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Heading, Intro & Key Highlights (col-span-4) */}
        <div className="flex flex-col lg:col-span-4 text-left">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            {intro.heading}
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-500 leading-relaxed mb-10">
            {intro.description}
          </p>

          {/* Dynamic Highlights List */}
          {bullets.length > 0 && (
            <ul className="space-y-6" aria-label="Key highlights">
              {bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 mt-0.5">
                    <DynamicIcon 
                      name={bullet.icon} 
                      className="w-5 h-5 text-gray-700" 
                    />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <span className="text-base font-semibold text-gray-800 tracking-wide block antialiased">
                      {bullet.text}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Column: Use Cases Mock Spaceholder (col-span-8) */}
        <div className="lg:col-span-8 h-full min-h-[450px] lg:min-h-[540px]">
          <div className="w-full h-full bg-gray-50 rounded-3xl flex flex-col items-center justify-center border border-gray-200/60 shadow-inner p-8 text-center transition-all duration-300 hover:bg-gray-100/50">
            {/* Step 2 Placeholder Icon/Graphic */}
            <div className="flex flex-col items-center gap-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                <Icons.Image className="w-7 h-7 text-gray-400 stroke-[1.5]" />
              </div>
              <h4 className="text-base font-bold text-gray-900 tracking-normal uppercase text-[12px]">Use Case Highlights</h4>
              <p className="text-sm text-gray-400 font-medium max-w-[280px]">
                Interactive imagery and destination layouts will populate here in Step 2.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductOverview;
