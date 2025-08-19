import React from 'react';
import {
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  // Static categories data
  const staticCategories = [
    { id: 1, name: 'Furniture' },
    { id: 2, name: 'Lighting' },
    { id: 3, name: 'Decor' },
    { id: 4, name: 'Textiles' },
    { id: 5, name: 'Storage' },
    { id: 6, name: 'Outdoor' },
    { id: 7, name: 'Kitchen' },
    { id: 8, name: 'Accessories' },
  ];

  return (
    <footer className="bg-gray-50 w-full border-t border-yellow-400 pt-4 sm:pt-6 pb-4 sm:pb-6 font-roboto">
      {/* Main Content Section */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pb-4 sm:pb-6 border-b border-yellow-400">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10">
          {/* Need Help Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-semibold text-gray-800">
              Need Help?
            </h3>
            <p className="text-[13px] text-gray-500">
              We're available to answer your queries and assist with your orders.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <FaPhone className="text-[22px] text-primary" />
              <div>
                <p className="text-[12px] text-gray-500">
                  Monday - Friday: 8am-9pm
                </p>
                <p className="text-[16px] font-semibold text-gray-800">
                  +91-XXXXXXXXXX
                </p>
                <p className="text-[16px] font-semibold text-gray-800 mt-1">
                  +91-YYYYYYYYYY
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <FaEnvelope className="text-[22px] text-primary" />
              <div>
                <p className="text-[12px] text-gray-500">
                  Need help with your order?
                </p>
                <p className="text-[14px] font-semibold text-gray-800">
                  support@masterofmedical.in
                </p>
              </div>
            </div>
          </div>

          {/* Explore More */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-semibold text-gray-800">
              Explore More
            </h3>
            <ul className="space-y-1.5">
              {[
                { text: 'Home', route: '/home' },
                { text: 'About us', route: '/about' },
                { text: 'Shop', route: '/Product' }, // Updated to match /Product route
                { text: 'Blogs', route: '/blogs' }, // Note: No /blogs route in App.jsx, may need to add it
                { text: 'Contact us', route: '/contact' },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.route}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.route);
                    }}
                    className="text-[13px] text-gray-500 hover:text-primary hover:underline transition-all duration-200"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-semibold text-gray-800">
              Categories
            </h3>
            <ul className="space-y-1.5">
              {staticCategories.length > 0 ? (
                staticCategories.map((item, index) => (
                  <li key={item.id || index}>
                    <span
                      className="text-[13px] text-gray-500 hover:text-primary hover:underline transition-all duration-200 cursor-pointer"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </li>
                ))
              ) : (
                <li>
                  <p className="text-[12px] text-gray-500 text-center italic mt-2">
                    No categories available
                  </p>
                </li>
              )}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-semibold text-gray-800">
              Help & Support
            </h3>
            <ul className="space-y-1.5">
              {[
                { text: 'Returns and refunds policy', route: '/returns' },
                { text: 'Disclaimer', route: '/disclaimer' },
                { text: 'Terms of use', route: '/terms' },
                { text: 'Privacy policy', route: '/privacy' },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.route}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.route);
                    }}
                    className="text-[13px] text-gray-500 hover:text-primary hover:underline transition-all duration-200"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect with Us & Download App */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-800 mb-2">
                Download Our App
              </h3>
              <div className="flex flex-col gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png"
                  alt="Google Play"
                  className="w-[100px] sm:w-[110px] md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity duration-300"
                  onClick={() => window.open('https://play.google.com/store', '_blank')}
                />
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  className="w-[100px] sm:w-[110px] md:w-[120px] cursor-pointer hover:opacity-80 transition-opacity duration-300"
                  onClick={() => window.open('https://www.apple.com/app-store/', '_blank')}
                />
              </div>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-800 mb-2">
                Follow Us
              </h3>
              <div className="flex gap-3 sm:gap-4 flex-wrap">
                {[
                  { Icon: FaFacebookF, url: 'https://www.facebook.com', color: '#4267B2' },
                  { Icon: FaTwitter, url: 'https://www.twitter.com', color: '#1DA1F2' },
                  { Icon: FaInstagram, url: 'https://www.instagram.com', color: '#E1306C' },
                  { Icon: FaLinkedinIn, url: 'https://www.linkedin.com', color: '#0077B5' },
                  { Icon: FaYoutube, url: 'https://www.youtube.com', color: '#FF0000' },
                ].map(({ Icon, url, color }, index) => (
                  <Icon
                    key={index}
                    className="text-[24px] sm:text-[28px] cursor-pointer transition-all duration-300"
                    style={{ color }}
                    onClick={() => window.open(url, '_blank')}
                    aria-label={`Visit our ${Icon.name} page`}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ff4747')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[13px] text-gray-500 text-center w-full">
          Copyright 2025 © Ratan Decor
        </p>
      </div>
    </footer>
  );
};

export default Footer;