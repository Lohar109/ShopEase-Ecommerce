import React from "react";

const DiscountBanner = () => {
  return (
    <section className="discount-banner-wrap" aria-label="First order discount offer">
      <div className="discount-banner-inner">
        <div className="discount-banner-left">
          <p className="discount-banner-title">Get 25% Off</p>
          <p className="discount-banner-subtitle">Up To ₹200 Off*</p>
        </div>

        <div className="discount-banner-code" aria-label="Coupon code">
          COUPON CODE: SHOPEASE25
        </div>

        <div className="discount-banner-right">
          <p>On Your First Order | T&amp;C Apply</p>
        </div>

        <span className="discount-banner-percent" aria-hidden="true">
          %
        </span>
      </div>
    </section>
  );
};

export default DiscountBanner;
