import React from 'react';
import { Lightbulb } from 'lucide-react';

const HowToUseTab = ({ product }) => {
  const { hero_image_url, title, description, tip } = product?.how_to_use || {};

  return (
    <div className="pdp-tab-content pdp-specs-tab-premium py-8 pt-6">
      {/* Top Layout Grid (12-column system) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-2">
        {/* Left Column (Text & Heading) - Takes 5 cols */}
        <div className="md:col-span-5 flex flex-col pt-0 mt-0 gap-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 w-full block leading-none">{title || "How to Use"}</h2>
          <p className="text-sm text-gray-600 leading-relaxed block">
            {description || ""}
          </p>

          {tip && (
            <div className="flex items-start gap-4">
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

      {/* Sub-items Horizontal Card Layout with Images */}
      {product?.how_to_use?.items && Array.isArray(product.how_to_use.items) && product.how_to_use.items.length > 0 && (
        <div className="mt-12 w-full overflow-x-auto">
          <div className="flex items-start justify-center gap-6 min-w-full px-4 py-4">
            {product.how_to_use.items.map((item, idx) => {
              const text = item.name || item.short_description || '';
              const parts = text.split(':');
              const stepTitle = parts[0]?.trim() || `Step ${idx + 1}`;
              const stepDesc = parts.length > 1 ? parts.slice(1).join(':').trim() : '';

              return (
                <div key={idx} className="flex items-start gap-6">
                  {/* Card */}
                  <div className="flex flex-col items-center gap-4 flex-shrink-0">
                    {/* Circular Image Container */}
                    <div
                      className="flex items-center justify-center flex-shrink-0 rounded-full border-4 bg-white shadow-sm"
                      style={{
                        width: '140px',
                        height: '140px',
                        borderColor: '#D4A574',
                        overflow: 'hidden',
                      }}
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={stepTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Title and Description */}
                    <div className="text-center">
                      <h4 className="font-bold text-gray-900 text-base leading-snug">{stepTitle}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mt-2">{stepDesc}</p>
                    </div>
                  </div>

                  {/* Arrow Connector */}
                  {idx < product.how_to_use.items.length - 1 && (
                    <div className="hidden md:flex items-center justify-center flex-shrink-0 h-full pt-12">
                      <span className="text-gray-400 text-3xl font-light">→</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default HowToUseTab;
