import React, { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const Contact = () => {
  useScrollToTop();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 min-h-screen font-sans">
      <div className="rounded-lg shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Get in Touch with Us</h2>
          <div className="w-12 h-1 bg-red-600"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone and Location Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Your location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Write a message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Send a Message
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Have Questions? Let's Connect</h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                If you have any questions about our products or would like to send us an inquiry, simply share your contact details here. We're happy to assist you!
              </p>
            </div>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-base sm:text-lg">08046076687</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-base sm:text-lg">info@example.com</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-base sm:text-lg leading-relaxed">
                    Ratan Decor No. 136, Sydenhams Lane, Opposite Nehru Indoor Stadium, Gate No. 1, Sydenhams Road, Periamet, Periyamet, Chennai - 600003, Tamil Nadu, India
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;