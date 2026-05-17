import React from 'react';
import * as Icons from 'lucide-react';

const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.Sparkles;
  return <IconComponent className={className} />;
};

const SpecificationsTab = ({ product }) => {
   const { spec_description, spec_video_url, spec_image, specifications, spec_highlights } = product || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">Product Specifications</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {spec_description}
          </p>
            {/* Inserted: Spec highlights capsule (left column) */}
            {spec_highlights?.grid_items?.length ? (
              <div
                className="w-full rounded-3xl p-6 mt-6"
                style={{ backgroundColor: '#ffffff' }}
              >
                <h3 className="text-center text-lg md:text-xl font-semibold text-gray-900">
                  {spec_highlights.grid_title}
                </h3>

                <style>{`
                  .spec-highlights-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 720px; margin: 1rem auto 0; align-items: start; }
                  .spec-highlights-grid > div { padding: 0.75rem 0.5rem; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; }
                  .spec-highlights-grid > div:not(:nth-child(3n)) { border-right: 1px solid rgba(0,0,0,0.06); }
                  .spec-highlights { padding-left: 1rem; padding-right: 1rem; }
                  .spec-highlight-icon { width:56px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:9999px; background:#d9c2a0; }
                  .spec-highlight-value{ font-weight:700; font-size:1rem; margin-top:0.25rem }
                  .spec-highlight-title{ font-weight:600; font-size:0.9rem; margin-top:0.125rem }
                  .spec-highlight-sub{ color:rgba(0,0,0,0.6); font-size:0.85rem; margin-top:0.25rem }
                  @media (max-width:1024px){ .spec-highlights-grid{ max-width:640px; } }
                  @media (max-width:768px){ .spec-highlights-grid{ grid-template-columns: repeat(2,1fr); max-width:100%; } .spec-highlights-grid > div:not(:nth-child(2n)){ border-right:none; border-bottom:1px solid rgba(0,0,0,0.06); } }
                `}</style>

                <div className="spec-highlights-grid">
                  {spec_highlights.grid_items.slice(0,3).map((item, index) => (
                    <div key={`${item.title || 'spec-highlight'}-${index}`} className="flex flex-col items-center text-center space-y-2">
                      <div className="spec-highlight-icon">
                        <DynamicIcon name={item.icon} className="w-6 h-6 text-[#7a5a3a]" />
                      </div>
                      <div className="spec-highlight-value text-gray-900">
                        {item.value}
                      </div>
                      <div className="spec-highlight-title text-gray-800">
                        {item.title}
                      </div>
                      <div className="spec-highlight-sub">
                        {item.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
        </div>

        {/* Right Column (Media Container) - Takes 7 cols */}
        <div className="md:col-span-7 min-w-0 w-full h-[350px] bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-6">
          {spec_video_url ? (
            <video 
              src={spec_video_url} 
              className="w-full h-full max-w-full max-h-full object-contain block mx-auto"
              style={{ borderRadius: '0.5rem' }}
              autoPlay 
              muted 
              loop 
              playsInline
            />
          ) : spec_image ? (
            <img 
              src={spec_image} 
              alt="Product Specifications" 
              className="w-full h-full max-w-full max-h-full object-contain block mx-auto"
              style={{ borderRadius: '0.5rem' }}
            />
          ) : null}
        </div>
      </div>

      {/* Bottom Layout: Specifications Table */}
      <div className="w-full">
        {Object.entries(specifications || {}).map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 py-4 flex text-sm">
            <div className="text-gray-500 font-normal w-1/3">
              {key}
            </div>
            <div className="text-gray-900 font-medium w-2/3">
              {Array.isArray(value) ? value.join(", ") : String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationsTab;
