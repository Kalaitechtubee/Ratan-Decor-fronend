import React from 'react';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import useScrollToTop from '../../hooks/useScrollToTop';

const CookiesPolicy = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#ff4747] mb-8 text-center">Cookies Policy</h1>
        
        <section className="mb-8">
          <p className="text-gray-700 mb-4">
            Ratan Decor uses cookies to enhance your browsing experience and provide personalized content. 
            This Cookies Policy explains what cookies are, how we use them, and your choices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">What Are Cookies?</h2>
          <p className="text-gray-700">
            Cookies are small text files stored on your device when you visit our website. 
            They help us remember your preferences, user type, and interactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Types of Cookies We Use</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <span className="font-medium">Essential Cookies:</span> Required for website functionality, 
              such as user type selection and session management. These cannot be disabled.
            </li>
            <li>
              <span className="font-medium">Analytics Cookies:</span> Track website usage (e.g., pages visited, time spent) 
              to improve performance and content.
            </li>
            <li>
              <span className="font-medium">Personalization Cookies:</span> Store your user type and preferences 
              to customize content and product displays.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">How We Use Cookies</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To remember your user type (Residential, Commercial, Modular Kitchen, Others) for a tailored experience.</li>
            <li>To enable login sessions and Customer Dashboard functionality.</li>
            <li>To analyze website performance and user behavior for improvements.</li>
            <li>To support AR functionality (Phase 3) by storing temporary visualization preferences.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Managing Cookies</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              You can disable non-essential cookies (analytics, personalization) via your browser settings. 
              Note that this may limit website functionality, such as personalized content.
            </li>
            <li>Essential cookies are required for the website to operate and cannot be disabled.</li>
            <li>To clear cookies, adjust your browser settings or delete them manually.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Third-Party Cookies</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Analytics tools and payment gateways may set their own cookies, subject to their respective policies.</li>
            <li>We do not control third-party cookies but ensure they align with our privacy standards.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Cookies Policy to reflect changes in our practices or legal requirements. 
            Updates will be posted on this page with the effective date.
          </p>
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
      <Footer/>
    </div>
  );
};

export default CookiesPolicy;