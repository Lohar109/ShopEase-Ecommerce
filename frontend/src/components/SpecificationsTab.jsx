import React from 'react';

const SpecificationsTab = ({ product }) => {
  const { spec_description, spec_video_url, spec_image, specifications } = product;

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
