import React from 'react';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import useScrollToTop from '../../hooks/useScrollToTop';

const Disclaimer = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#ff4747] mb-8 text-center">Disclaimer</h1>

        <section className="mb-8">
          <p className="text-gray-700 mb-4">
            The information provided on the Ratan Decor website is for general informational purposes only. 
            While we strive to ensure accuracy, we make no warranties or representations regarding the completeness, 
            accuracy, or reliability of the content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Product Information</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Product specifications, images, and descriptions are provided to the best of our knowledge. 
              Slight variations in color, texture, or finish may occur due to natural materials (e.g., Veneer, Solid Wood) 
              or manufacturing processes.
            </li>
            <li>
              Prices and availability are subject to change without notice.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Augmented Reality (AR)</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              The AR feature (available in Phase 3) is designed to provide a realistic visualization of products in your space. 
              However, the actual appearance may vary due to lighting, device display settings, or environmental factors.
            </li>
            <li>
              Ratan Decor is not liable for decisions made based on AR visualizations.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Third-Party Services</h2>
          <p className="text-gray-700">
            Payment gateways, CRM integrations, and other third-party services are subject to their respective terms and conditions. 
            Ratan Decor is not responsible for issues arising from third-party service providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Limitation of Liability</h2>
          <p className="text-gray-700">
            Ratan Decor is not liable for any direct, indirect, incidental, or consequential damages arising from the use of our website, 
            products, or services, except as required by applicable law.
          </p>
        </section>

        <section>
          <p className="text-gray-700">
            For further clarification, please contact our support team via the{' '}
            <a href="/contact" className="text-[#ff4747] hover:underline">
              Contact Us
            </a>{' '}
            page.
          </p>
        </section>
      </div><Footer/>
    </div>
  );
};

export default Disclaimer;