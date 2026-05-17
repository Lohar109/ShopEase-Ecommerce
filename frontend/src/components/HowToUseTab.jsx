import React from 'react';
import { Lightbulb } from 'lucide-react';

const HowToUseTab = ({ product }) => {
  const { hero_image_url, title, description, tip } = product?.how_to_use || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-2">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "How to Use"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>

          {tip && (
            <div className="flex items-start gap-4 mt-5 mb-6">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 107, 107, 0.08)',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Lightbulb className="w-4 h-4" style={{ color: '#c21f58ff' }} />
              </div>
              <span className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-900">Tip:</strong> {tip}
              </span>
            </div>
          )}
        </div>

        {/* Right Column (Media Container) - Takes 7 cols */}
        <div className="md:col-span-7 min-w-0 w-full bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden p-0" style={{ height: '366px', marginTop: '-16px' }}>
          {hero_image_url ? (
            <img
              src={hero_image_url}
              alt={title || "How to Use"}
              className="w-full h-full object-cover block mx-auto"
            />
          ) : null}
        </div>
      </div>

      {/* Sub-items Timeline Layout */}
      {product?.how_to_use?.items && Array.isArray(product.how_to_use.items) && product.how_to_use.items.length > 0 && (
        <div className="flex flex-col gap-6 mt-12 relative">
          {/* Vertical Line */}
          {product.how_to_use.items.length > 1 && (
            <div
              className="absolute top-8 bottom-8 w-px bg-gray-200 hidden md:block"
              style={{ left: '3.25rem' }}
            ></div>
          )}

          {product.how_to_use.items.map((item, idx) => {
            const text = item.name || item.short_description || '';
            const parts = text.split(':');
            const stepTitle = parts[0]?.trim() || `Step ${idx + 1}`;
            const stepDesc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

            return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">

                {/* Left Column: Timeline Step */}
                <div className="md:col-span-5 flex items-start gap-6 pl-4 md:pl-8">
                  {/* Badge */}
                  <div className="pdp-inclusions-badge relative z-10">
                    {idx + 1}
                  </div>

                  {/* Text */}
                  <div className="pt-2">
                    <h4 className="font-bold text-gray-900 text-base leading-none mb-2">{stepTitle}</h4>
                    {stepDesc && (
                      <p className="text-gray-600 text-sm leading-relaxed pr-4">{stepDesc}</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Image */}
                <div className="md:col-span-7 flex justify-start">
                  <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm" style={{ width: '400px', height: '275px', flexShrink: 0 }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={stepTitle}
                        className="w-full h-full object-cover block"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default HowToUseTab;
