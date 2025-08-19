import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useScrollToTop from '../../hooks/useScrollToTop';

const ReturnsAndRefundsPolicy = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      <Navbar/>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#ff4747] mb-8 text-center">Returns and Refunds Policy</h1>

        <section className="mb-8">
          <p className="text-gray-700 mb-4">
            At Ratan Decor, we strive to ensure customer satisfaction. Please review our Returns and Refunds Policy below:
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Eligibility for Returns</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Products may be returned within 7 days of delivery if they are defective, damaged, or not as described.
            </li>
            <li>
              Returns are not accepted for custom-made or personalized products (e.g., specific Modular Kitchen designs or custom-cut materials) unless defective.
            </li>
            <li>
              Products must be unused, in original packaging, and in the same condition as received.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Return Process</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <span className="font-medium">Initiate a Return:</span> Log in to your Customer Dashboard, go to Order History, select the order, and click "Request Return."
            </li>
            <li>
              <span className="font-medium">Submit Details:</span> Provide the reason for return and upload images of the product if defective or damaged.
            </li>
            <li>
              <span className="font-medium">Approval:</span> Our team will review the request within 2-3 business days. You’ll be notified of approval or rejection via email.
            </li>
            <li>
              <span className="font-medium">Return Shipping:</span> If approved, we’ll provide a return shipping label or instructions. Customers are responsible for return shipping costs unless the product is defective.
            </li>
            <li>
              <span className="font-medium">Inspection:</span> Returned products are inspected upon receipt. Refunds or replacements are processed within 5-7 business days after inspection.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Refunds</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Refunds are issued to the original payment method or as store credit, based on customer preference.
            </li>
            <li>
              For manual payments (e.g., UPI, Bank Transfer), refunds are processed to the provided bank account within 7-10 business days.
            </li>
            <li>
              A 2% transaction fee (platform commission) is non-refundable for orders placed via the payment gateway.
            </li>
            <li>
              Refunds for approved returns exclude shipping costs unless the return is due to our error.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">Non-Returnable Items</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Products purchased under special promotions or clearance sales.</li>
            <li>Items damaged due to misuse or improper handling.</li>
            <li>Products without original packaging or proof of purchase.</li>
          </ul>
        </section>

        <section>
          <p className="text-gray-700">
            For assistance, contact our support team via the{' '}
            <a href="/contact" className="text-[#ff4747] hover:underline">
              Contact Us
            </a>{' '}
            page, Direct Call, or WhatsApp.
          </p>
        </section>
      </div>
      <Footer/>
    </div>
  );
};

export default ReturnsAndRefundsPolicy;