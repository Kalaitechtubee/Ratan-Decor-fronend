import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useScrollToTop from '../../hooks/useScrollToTop';
import { useSeo } from '../../context/SeoContext'; // Import useSeo hook
import { Helmet } from 'react-helmet-async'; // Import Helmet for local SEO overrides if needed

const Privacy = () => {
  useScrollToTop();
  const { seoData } = useSeo(); // Access SEO data from context

  // Use SEO data for the 'privacy' page, fallback to default if not available
  const seo = seoData['privacy'] || {
    title: 'Privacy Policy - Ratan Decor',
    description: 'Learn about Ratan Decor\'s privacy practices and how we protect your personal information.',
    keywords: 'privacy, policy, data protection, ratan decor',
  };

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
      </Helmet>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#ff4747] mb-8 text-center">Privacy Policy</h1>

        <section className="mb-8">
          <p className="text-gray-700 mb-4">
            Ratan Decor is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <span className="font-medium">User Type Selection:</span> Your selected user type (Residential, Commercial, Modular Kitchen, Others) to customize website content.
            </li>
            <li>
              <span className="font-medium">Account Information:</span> Name, email, phone number, and user type (General Customer, Architect, Dealer) provided during registration.
            </li>
            <li>
              <span className="font-medium">Enquiry Data:</span> Information submitted via Email Form, Direct Call, or WhatsApp, including name, contact details, and enquiry specifics.
            </li>
            <li>
              <span className="font-medium">Payment Information:</span> For manual payments (e.g., UPI, Bank Transfer), we collect payment screenshots and bank details for refunds. Payment gateway data is handled by third-party providers.
            </li>
            <li>
              <span className="font-medium">Usage Data:</span> IP address, browser type, pages visited, and interactions with the website for analytics purposes.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To personalize website content based on your user type.</li>
            <li>To process enquiries, orders, and video call appointments.</li>
            <li>To verify Architect and Dealer accounts.</li>
            <li>To communicate order updates, confirmations, or support responses.</li>
            <li>To integrate enquiry data with our CRM via API for tracking and updates.</li>
            <li>To improve website functionality and user experience through analytics.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Data Sharing</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Enquiry data is shared with our CRM via API for processing and status updates. If CRM service is discontinued, all data remains accessible to Ratan Decor.</li>
            <li>Payment data is processed by third-party payment gateways, subject to their privacy policies.</li>
            <li>We do not sell or share your personal information with third parties for marketing purposes without your consent.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Data Security</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>We use SSL encryption to secure data transmission.</li>
            <li>Enquiry and user data are stored securely in our admin panel with role-based access control.</li>
            <li>While we take reasonable measures to protect your data, no system is completely secure. You share information at your own risk.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Your Rights</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access, update, or delete your account information via the Customer Dashboard.</li>
            <li>Request a copy of your data or opt out of data collection (subject to operational requirements, e.g., order processing).</li>
            <li>Contact our support team to exercise these rights.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Data Retention</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Enquiry and order data are retained for as long as necessary to fulfill business purposes or as required by law.</li>
            <li>If you delete your account, personal information is removed, except for data required for legal or operational purposes (e.g., order records).</li>
          </ul>
        </section>

        <section>
          <p className="text-gray-700">
            For questions, contact us via the{' '}
            <a href="/contact" className="text-[#ff4747] hover:underline">
              Contact Us
            </a>{' '}
            page.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;