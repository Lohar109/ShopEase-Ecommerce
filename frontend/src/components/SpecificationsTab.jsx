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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-10">
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
                  .spec-highlights-grid > div { padding: 0.75rem 0.5rem; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; text-align: center; }
                  .spec-highlights-grid > div:not(:nth-child(3n)) { border-right: 1px solid rgba(0,0,0,0.06); }
                  .spec-highlights { padding-left: 1rem; padding-right: 1rem; }
                  .spec-highlight-icon { width:56px; height:56px; display:flex; align-items:center; justify-content:center; border-radius:9999px; background:#d9c2a0; }
                  .spec-highlight-value{ font-weight:700; font-size:1rem; margin-top:0.25rem; text-align: center; }
                  .spec-highlight-title{ font-weight:600; font-size:0.9rem; margin-top:0.125rem; text-align: center; }
                  .spec-highlight-sub{ color:rgba(0,0,0,0.6); font-size:0.85rem; margin-top:0.25rem; text-align: center; }
                  .spec-media-container { width: 100%; height: 500px; align-self: start; }
                  @media (max-width:1024px){ .spec-highlights-grid{ max-width:640px; } }
                  @media (max-width:768px){ 
                    .spec-highlights-grid{ grid-template-columns: repeat(2,1fr); max-width:100%; } 
                    .spec-highlights-grid > div:not(:nth-child(2n)){ border-right:none; border-bottom:1px solid rgba(0,0,0,0.06); } 
                    .spec-media-container { height: 320px; }
                  }
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
        <div className="md:col-span-7 min-w-0 spec-media-container bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
          {spec_video_url ? (
            <video 
              src={spec_video_url} 
              className="w-full h-full object-contain block mx-auto"
              autoPlay 
              muted 
              loop 
              playsInline
            />
          ) : spec_image ? (
            <img 
              src={spec_image} 
              alt="Product Specifications" 
              className="w-full h-full object-contain block mx-auto"
            />
          ) : null}
        </div>
      </div>

      {product?.spec_bottom_banner ? (
        <div className="w-full mt-10">
            <img
            src={product.spec_bottom_banner}
            alt="Product banner"
            className="w-full h-auto mt-10 rounded-2xl shadow-sm object-cover"
          />
        </div>
      ) : null}

      {/* Bottom Layout: Specifications Table */}
      {specifications && Object.keys(specifications).length > 0 && (
        <div className="w-full rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb', marginTop: '3rem' }}>
          {/* Header */}
          <div className="flex text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '12px 24px', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ width: '38%' }}>Specification</div>
            <div style={{ width: '62%' }}>Details</div>
          </div>
          {/* Rows */}
          {Object.entries(specifications).map(([key, value], idx) => (
            <div
              key={key}
              className="flex text-sm items-center"
              style={{
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                padding: '14px 24px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ width: '38%', color: '#6b7280', fontWeight: 500, paddingRight: '1rem' }}>
                {key}
              </div>
              <div style={{ width: '62%', color: '#111827', fontWeight: 600 }}>
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecificationsTab;
