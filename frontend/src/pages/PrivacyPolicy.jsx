import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Shield, Eye, Database, Share2, ExternalLink, Settings, ShieldCheck, Mail, Calendar } from "lucide-react";
import "./PrivacyPolicy.css";

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction & Trust Disclaimer",
    icon: Lock,
    content: `We value the trust you place in us and recognize the importance of secure transactions and information privacy. This Privacy Policy describes how ShopEase Internet Private Limited and its affiliates, group companies and related parties (collectively “ShopEase, we, our, us”) collect, use, share or otherwise process your personal data through our website, mobile application, and mobile site (hereinafter referred to as the “Platform”).

While you can browse sections of the Platform without the need of sharing any information with us, however, please note we do not offer any product or service under this Platform outside India and your personal data will primarily be stored and processed in India. 

By visiting this Platform, providing your information or availing our product/service, you expressly agree to be bound by the terms and conditions of this Privacy Policy, the Terms of Use and the applicable service/product terms and conditions.`
  },
  {
    id: "collection",
    title: "2. Collection of Your Information",
    icon: Database,
    content: `When you use our Platform, we collect and store your personal data which is provided by you from time to time to provide you a safe, efficient, smooth and customized experience. This includes information such as email address, delivery address, name, phone number, credit/debit card and other payment instrument details or medical or health-related information from you when you set up an account or transact with us.

We collect and analyse your personal data relating to your buying behavior, browsing patterns, preferences, and other information that you choose to provide while interacting with our Platform. If you enroll in our loyalty and membership programs, we will collect lifestyle, demographic, lifestyle and transaction details provided by you to ShopEase or third-party partner platforms.`
  },
  {
    id: "use",
    title: "3. Use of Demographic / Profile Data",
    icon: Eye,
    content: `We use your personal data to take and fulfill orders, deliver products and services, process payments, and communicate with you about orders, products and services, and promotional offers. We use your personal data to assist sellers and business partners in handling and fulfilling orders, enhance customer experience, troubleshoot problems, measure consumer interest, and detect and protect us against error, fraud and other criminal activity.

With your consent, we may have access to your SMS, contacts, location, camera, photo gallery and device information, or request PAN, GST Number, or Know-Your-Customer (KYC) details to check your eligibility for insurance, credit, and payment products or issue GST invoices.`
  },
  {
    id: "cookies",
    title: "4. Cookies & Analytical Tools",
    icon: Settings,
    content: `We use data collection devices such as "cookies" on certain pages of the Platform to help analyze our web page flow, measure promotional effectiveness, and promote trust and safety. Cookies do not contain any of your personal data. We offer features only available through cookies, and cookies allow you to enter your password less frequently during a session.

We also use cookies from third-party partners such as Google Analytics for marketing and analytical purposes to understand how our customers use the Platform, which are subject to Google's privacy policies.`
  },
  {
    id: "sharing",
    title: "5. Sharing of Personal Data",
    icon: Share2,
    content: `We may share personal data with ShopEase corporate entities, affiliates, related companies, and financial partners (such as UPI platforms) to help detect and prevent identity theft, fraud and other potentially illegal acts, facilitate joint or co-branded services, or offer deferred payment lines (like PayLater products).

Additionally, we may disclose your personal data to our sellers, business partners, or logistics transporters for the fulfillment of orders, customer service assistance, market research, or as required by law to respond to subpoenas, court orders, or other legal processes.`
  },
  {
    id: "membership",
    title: "6. Plus Membership & Partner Services",
    icon: ShieldCheck,
    content: `To provide our Plus members with bundled third-party benefits (such as streaming subscriptions, including Netflix), we may share your personal information (including name, email address, and mobile number) with our service partners. 

This data is shared strictly to facilitate seamless account activation on the partner platform, and enable customer outreach and support via SMS, Email, and WhatsApp to help you activate and manage your benefits.`
  },
  {
    id: "links",
    title: "7. Links to Other Sites",
    icon: ExternalLink,
    content: `Our Platform may provide links to other websites or applications that may collect personal data about you. ShopEase is not responsible for the privacy practices or the content of those linked websites, and we encourage you to read their privacy policies prior to disclosing any information.`
  },
  {
    id: "security",
    title: "8. Security Precautions & Safeguards",
    icon: Shield,
    content: `We maintain strict physical, electronic, and procedural safeguards to protect your information. Whenever you access your account information, we offer the use of a secure server. Once your information is in our possession, we adhere to our security guidelines to protect it against unauthorized access.

By using the Platform, users accept the inherent security implications of data transmission over the internet, and therefore, there would always remain certain inherent risks regarding use of the Platform.`
  },
  {
    id: "optout",
    title: "9. Choice & Opt-Out Rights",
    icon: Settings,
    content: `We provide all users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications after setting up an account with us. 

If you do not wish to receive promotional communications from us, you can manage your preferences on our Notification Preference page or unsubscribe/opt-out directly.`
  },
  {
    id: "retention",
    title: "10. Data Retention Policy",
    icon: Database,
    content: `We retain your personal data in accordance with applicable laws, for a period no longer than is required for the purpose for which it was collected or as required under any applicable law. 

We may retain data related to you if we believe it may be necessary to prevent fraud or future abuse, to enable us to exercise legal rights, or if required by law, or in anonymized form for analytical and research purposes.`
  },
  {
    id: "rights",
    title: "11. Your Rights & Consent",
    icon: ShieldCheck,
    content: `You may access, correct, and update your personal data directly through the functionalities provided on the Platform. You can delete certain non-mandatory information by visiting Profile and Settings sections. 

You have an option to withdraw your consent that you have already provided by writing to us. Please note that withdrawal of consent will not be retroactive and may hamper your access to certain Platform features.`
  },
  {
    id: "grievance",
    title: "12. Grievance Officer & Contact",
    icon: Mail,
    content: `In accordance with Information Technology Act, 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:

Grievance Officer: Mr. Karthik R
Designation: Associate Director, Privacy Compliance
ShopEase Internet Private Limited
Email: privacy.grievance@shopease.com

For customer support queries or concerns related to the collection or usage of your personal data under this Privacy Policy, please write to us at privacy.grievance@shopease.com.`
  }
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSectionClick = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // Sticky header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="privacy-page-container">
      {/* Header Breadcrumbs */}
      <div className="privacy-header-nav">
        <Link to="/" className="privacy-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <div className="privacy-badge-tag">ShopEase Trust</div>
      </div>

      <div className="privacy-hero-section">
        <h1>Privacy Policy</h1>
        <p className="privacy-last-updated">Last Updated: April 2026</p>
        <p className="privacy-subtitle">
          We value your data privacy. Learn how we collect, store, share, and protect your personal information on our marketplace platform.
        </p>
      </div>

      <div className="privacy-layout-grid">
        {/* Left Sticky Sidebar */}
        <aside className="privacy-sidebar-nav">
          <div className="sidebar-scroll-box">
            <h3>Privacy sections</h3>
            <ul className="sidebar-link-list">
              {SECTIONS.map((sec) => {
                const IconComponent = sec.icon;
                return (
                  <li key={sec.id}>
                    <button
                      onClick={() => handleSectionClick(sec.id)}
                      className={`sidebar-nav-btn ${activeSection === sec.id ? "active" : ""}`}
                    >
                      <IconComponent size={16} className="sidebar-icon" />
                      <span>{sec.title.split(". ")[1]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Right Scrollable Content Pane */}
        <main className="privacy-content-pane">
          <div className="privacy-disclaimer-card">
            <ShieldCheck size={20} className="disclaimer-icon" />
            <div className="disclaimer-text">
              <strong>Your Privacy Guarantee:</strong> By visiting this Platform, providing your information, or availing our products and services, you agree to be bound by the terms of this Privacy Policy and standard laws of India.
            </div>
          </div>

          <div className="privacy-sections-list">
            {SECTIONS.map((sec) => {
              const IconComponent = sec.icon;
              return (
                <section key={sec.id} id={sec.id} className="privacy-content-section">
                  <div className="section-title-wrap">
                    <div className="section-title-icon-box">
                      <IconComponent size={20} />
                    </div>
                    <h2>{sec.title}</h2>
                  </div>
                  <div className="section-body-text">
                    {sec.content.split("\n\n").map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                  <div className="section-end-divider" />
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
