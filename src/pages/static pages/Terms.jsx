import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useScrollToTop from '../../hooks/useScrollToTop';

const Terms = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#ff4747] mb-8 text-center">Terms of Use</h1>

        <section className="mb-8">
          <p className="text-gray-700 mb-4">
            By accessing or using the Ratan Decor website, you agree to be bound by these Terms of Use. Please read them carefully.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Website Access</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              You must select a user type (Residential, Commercial, Modular Kitchen, Others) on your first visit to access the website. This selection customizes content and cannot be bypassed.
            </li>
            <li>
              The "Change Type" option allows you to switch user types at any time.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">User Accounts</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              General Customers and Architects can register via the website. Architect accounts require manual verification.
            </li>
            <li>
              Dealer accounts are created by admins upon approval of a Dealer Request or submitted information.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Orders and Payments</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Orders can be placed via the payment gateway or manual methods (Google Pay, UPI, Bank Transfer). Manual payments require a payment screenshot upload for verification.
            </li>
            <li>
              A 2% platform commission applies to payment gateway transactions.
            </li>
            <li>
              Orders are subject to approval by our admin team, especially for manual payments.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Intellectual Property</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              All content on the Ratan Decor website, including text, images, and designs, is the property of Ratan Decor or its licensors and is protected by copyright and trademark laws.
            </li>
            <li>
              You may not reproduce, distribute, or modify any content without prior written permission.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Prohibited Activities</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Using the website for unlawful purposes or in violation of these Terms.</li>
            <li>Attempting to bypass user type selection or access restricted areas (e.g., admin panel, unverified pricing).</li>
            <li>Uploading malicious code or engaging in activities that disrupt website functionality.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Termination</h2>
          <p className="text-gray-700">
            Ratan Decor reserves the right to suspend or terminate your access to the website for violating these Terms or engaging in fraudulent activity.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by the laws of India. Any disputes will be resolved in the courts of [Insert City/State].
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

export default Terms;