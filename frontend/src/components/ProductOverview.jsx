import React from 'react';
import * as Icons from 'lucide-react';

/**
 * Dynamic Icon component to render dynamic icon based on database string
 */
const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
};

const ProductOverview = ({ overview, product, specifications, setActiveTab }) => {
  // console logging tracker per instructions
  console.log('Overview Content:', overview);

  // Safe guard against null prop
  if (!overview || !overview.intro) {
    return null;
  }

  // Logic refinements based on console log inspection:
  // Highlights location resolution
  const highlightsList = Array.isArray(overview.highlights) 
    ? overview.highlights 
    : (Array.isArray(overview.intro?.bullets) ? overview.intro.bullets : []);
  
  // Specifications key resolution (supports both product.specs and product.specifications)
  const activeSpecs = product?.specs || product?.specifications || specifications || {};
  const useCases = Array.isArray(overview.use_cases) ? overview.use_cases : [];

  return (
    <>
      {/* CSS Overrides: Explicit backing for requested Tailwind utility layouts since PostCSS is absent */}
      <style>{`
        .grid { display: grid; }
        .items-start { align-items: flex-start; }
        .gap-10 { gap: 2.5rem; }
        .gap-8 { gap: 2rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-4 { gap: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        
        .mt-12 { margin-top: 3rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .pb-4 { padding-bottom: 1rem; }
        .p-6 { padding: 1.5rem; }
        
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-shrink-0 { flex-shrink: 0; }
        .flex-1 { flex: 1 1 0%; }
        .block { display: block; }
        .h-full { height: 100%; }
        .max-w-md { max-width: 28rem; }
        
        .overflow-hidden { overflow: hidden; }
        .overflow-x-auto { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-start { scroll-snap-align: start; }
        
        /* Scrollbar-free design helper */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .bg-white { background-color: #ffffff; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-transparent { background-color: transparent; }
        .border { border: 1px solid #e5e7eb; }
        .border-b { border-bottom: 1px solid #f3f4f6; }
        .border-none { border: none; }
        .border-gray-100 { border-color: #f3f4f6; }
        .border-gray-50 { border-color: #f9fafb; }
        
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .transition-shadow { transition: box-shadow 0.2s; }
        .hover\\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .object-cover { object-fit: cover; }
        
        /* Fixed Dimension Controls */
        .min-w-\\[280px\\] { min-width: 280px; flex-shrink: 0; }
        .h-\\[400px\\] { height: 400px; }
        
        .w-5 { width: 1.25rem; }
        .h-5 { height: 1.25rem; }
        
        /* Typography mappings */
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-xs { font-size: 0.75rem; }
        
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-normal { font-weight: 400; }
        .font-light { font-weight: 300; }
        
        .tracking-tight { letter-spacing: -0.025em; }
        .leading-tight { line-height: 1.25; }
        .leading-relaxed { line-height: 1.625; }
        
        .text-gray-900 { color: #111827; }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-400 { color: #9ca3af; }
        .text-right { text-align: right; }
        
        /* Step 3 specifications typography */
        .spec-link { 
          display: inline-block; 
          margin-top: auto; 
          font-size: 0.875rem; 
          font-weight: 600; 
          color: #2563eb; 
          cursor: pointer; 
          text-decoration: none; 
          padding: 0;
          text-align: left;
        }
        .spec-link:hover {
          text-decoration: underline;
          color: #1d4ed8;
        }
        
        /* Responsive grids */
        .grid-cols-1 { grid-template-columns: 1fr; }
        
        @media (min-width: 768px) {
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 1024px) {
          .lg\\:grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
          .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
          .lg\\:col-span-5 { grid-column: span 5 / span 5; }
          .lg\\:col-span-7 { grid-column: span 7 / span 7; }
        }
      `}</style>

      <div className="product-overview-root w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Section: 12-Column Grid with explicitly wider gap-10 gutter & strict items-start top alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (col-span-5): Dynamic Small Heading, Refined Description, and Conditional Highlights */}
          <div className="lg:col-span-5 flex flex-col text-left m-0 p-0">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight mb-3 max-w-md">
              {product?.name}
            </h2>
            
            {/* Exact description renderer checking .text key instructed by user - lightened with font-normal */}
            {overview?.intro?.text && <p className='text-gray-400 text-lg mb-8 leading-relaxed font-normal'>{overview.intro.text}</p>}

            {/* Highlights List - hidden if missing from both possible root locations */}
            {highlightsList && highlightsList.length > 0 && (
              <div className="flex flex-col" aria-label="Product key highlights">
                {highlightsList.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2">
                    <DynamicIcon name={bullet.icon} className="w-5 h-5 text-gray-600" />
                    <span className="text-base text-gray-600 font-medium">{bullet.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (col-span-7): Image Scale Restricting Use Case Gallery */}
          <div className="lg:col-span-7 overflow-hidden w-full">
            {useCases.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 snap-x pb-4 no-scrollbar">
                {useCases.map((item, idx) => {
                  const imageUrl = typeof item === 'string' ? item : (item?.image || '');
                  if (!imageUrl) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      className="min-w-[280px] h-[400px] rounded-3xl overflow-hidden shadow-sm snap-start flex-shrink-0 bg-gray-50"
                    >
                      <img 
                        src={imageUrl} 
                        alt={`Use Case ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full aspect-[16/9] min-h-[280px] bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                <Icons.Image className="w-10 h-10 mb-2 opacity-60" />
                <p className="text-sm font-semibold uppercase tracking-wider">No Use Cases Set</p>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Section (4-Column Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          
          {/* Step 3: Specifications Map Tracker */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 flex-shrink-0">
              <Icons.Cpu className="w-5 h-5 text-gray-600" />
              Specifications
            </h3>
            
            <div className="flex-1 mb-4 overflow-hidden">
              {activeSpecs && Object.keys(activeSpecs).length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {Object.entries(activeSpecs).slice(0, 5).map(([key, value], idx) => (
                    <div key={idx} className="flex items-center justify-between border-b py-1 text-sm gap-4">
                      <span className="font-bold text-gray-900 capitalize">{key}</span>
                      <span className="text-gray-500 text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 leading-relaxed">Detailed technical specifications pending.</div>
              )}
            </div>

            <button 
              type="button"
              className="spec-link border-none bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                if (setActiveTab) {
                  setActiveTab('Specifications');
                  setTimeout(() => {
                    const tabSection = document.querySelector('.pdp-tab-content-wrapper');
                    if (tabSection) {
                      tabSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 80);
                }
              }}
            >
              View full details →
            </button>
          </div>

          {/* What's in the Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 flex-shrink-0">
              <Icons.Package className="w-5 h-5 text-gray-600" />
              What's in the Box
            </h3>
            <div className="text-sm text-gray-500 leading-relaxed flex-1">Component inventory mapping pending.</div>
          </div>

          {/* Perfect For */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 flex-shrink-0">
              <Icons.Compass className="w-5 h-5 text-gray-600" />
              Perfect For
            </h3>
            <div className="text-sm text-gray-500 leading-relaxed flex-1">Scenario context mapping pending.</div>
          </div>

          {/* Why You'll Love It */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 flex-shrink-0">
              <Icons.Heart className="w-5 h-5 text-gray-600" />
              Why You'll Love It
            </h3>
            <div className="text-sm text-gray-500 leading-relaxed flex-1">Value proposition outlines pending.</div>
          </div>

        </div>

      </div>
    </>
  );
};

export default ProductOverview;
