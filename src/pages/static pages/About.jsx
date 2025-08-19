import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import useScrollToTop from '../../hooks/useScrollToTop';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 },
  },
};

const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6 },
  },
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const About = () => {
  useScrollToTop();
  return (
    <div className="bg-white min-h-screen font-roboto">
      <Navbar/>
      {/* Hero Section - Two Column Layout */}
      <motion.section
        className="min-h-screen flex flex-col lg:flex-row"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Column - Visual Content */}
        <motion.div className="lg:w-1/2 relative" variants={slideInFromLeft}>
          <div className="relative h-full">
            <motion.img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Interior Design Showcase"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              loading="lazy"
            />
            {/* Circular Overlay in Bottom Right */}
            <motion.div
              className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
              whileHover={{ rotate: 10 }}
            >
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                alt="Close-up of Teak Door Frame"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Content */}
        <motion.div
          className="lg:w-1/2 bg-white p-8 sm:p-12 lg:p-16 flex items-center"
          variants={slideInFromRight}
        >
          <motion.div
            className="max-w-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Company Tag */}
            <motion.div
              className="inline-block bg-primary text-white px-4 py-2 rounded-md text-sm font-semibold mb-6"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              About Ratan Decor
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              variants={itemVariants}
            >
              Why Choose Our
              <span className="text-primary"> Interior Design</span> Services
            </motion.h1>

            {/* Introductory Paragraph */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed"
              variants={itemVariants}
            >
              At Ratan Decor, we provide premium interior design solutions with a focus on quality plywood, mica sheets, and teak frames. Our personable and knowledgeable team ensures your space is transformed with elegance and functionality.
            </motion.p>

            {/* Feature Blocks */}
            <motion.div
              className="space-y-6 mb-8"
              variants={containerVariants}
            >
              {/* Quality Standards */}
              <motion.div
                className="flex items-center space-x-4"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quality Standards Product</h3>
                  <p className="text-gray-600 text-sm">Premium plywood and teak craftsmanship</p>
                </div>
              </motion.div>

              {/* Cost Effective */}
              <motion.div
                className="flex items-center space-x-4"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cost Effective Services</h3>
                  <p className="text-gray-600 text-sm">Best value for your investment</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Additional Content */}
            <motion.p
              className="text-gray-600 mb-8 leading-relaxed text-base sm:text-lg"
              variants={itemVariants}
            >
              Our commitment to excellence ensures that every project, from residential to commercial, is executed with precision and creativity, using high-quality materials like waterproof plywood and designer mica sheets.
            </motion.p>

            {/* CTA Button and Feature Tag */}
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
              variants={itemVariants}
            >
              <motion.a
                href="/products"
                className="bg-primary text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold hover:bg-[#e03e3e] focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Products
              </motion.a>

              <motion.div
                className="border-2 border-dashed border-primary bg-gray-50 px-4 py-3 rounded-lg flex items-center space-x-2"
                whileHover={{ scale: 1.03 }}
              >
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Premium Interior Solutions</span>
              </motion.div>
            </motion.div>

            {/* Decorative Pattern */}
            <motion.div
              className="absolute bottom-8 left-8 opacity-20 hidden sm:block"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Rest of the content sections */}
      <div className="container mx-auto px-4 py-16">
        {/* Our Story Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12">
            <motion.div className="lg:w-1/2" variants={slideInFromLeft}>
              <div className="relative">
                <motion.img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Showroom with Plywood and Mica Products"
                  className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-2xl shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </motion.div>

            <motion.div className="lg:w-1/2" variants={slideInFromRight}>
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
                variants={itemVariants}
              >
                Our Story
              </motion.h2>
              <motion.p
                className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6"
                variants={itemVariants}
              >
                Founded in 2010, Ratan Decor began with a vision to redefine interior design through quality craftsmanship. Specializing in plywood, mica sheets, and teak frames, we've grown into a trusted name, serving customers with tailored solutions that blend aesthetics and durability.
              </motion.p>
              <motion.p
                className="text-base sm:text-lg text-gray-600 leading-relaxed"
                variants={itemVariants}
              >
                Today, we lead the industry by combining traditional craftsmanship with modern technology, creating spaces that inspire and endure.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Mission & Vision Section - 2x2 Grid Layout */}
        <motion.section
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Our Mission & Vision</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Driving excellence in interior design with premium materials
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0 rounded-2xl overflow-hidden shadow-2xl">
            {/* Top Left - Mission Text */}
            <motion.div
              className="bg-white p-6 sm:p-8 lg:p-12 text-gray-800 border-r border-b border-gray-200"
              variants={slideInFromLeft}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-primary">OUR MISSION</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg">
                To empower customers to create inspiring spaces with high-quality plywood, mica, and teak products. We leverage innovative technology to provide seamless experiences for homeowners, architects, and dealers.
              </p>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Every product we offer is designed to tell a story of quality, durability, and style.
              </p>
            </motion.div>

            {/* Top Right - Mission Image */}
            <motion.div
              className="bg-white p-6 sm:p-8 lg:p-12 flex items-center justify-center border-b border-gray-200"
              variants={slideInFromRight}
            >
              <motion.div className="relative w-full h-48 sm:h-64 lg:h-80" whileHover={{ scale: 1.03 }}>
                <img
                  src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Modern Kitchen with Plywood Cabinets"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </motion.div>
            </motion.div>

            {/* Bottom Left - Vision Image */}
            <motion.div
              className="bg-white p-6 sm:p-8 lg:p-12 flex items-center justify-center border-r border-gray-200"
              variants={slideInFromLeft}
            >
              <motion.div className="relative w-full h-48 sm:h-64 lg:h-80" whileHover={{ scale: 1.03 }}>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Elegant Bedroom with Teak Furniture"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </motion.div>
            </motion.div>

            {/* Bottom Right - Vision Text */}
            <motion.div
              className="bg-white p-6 sm:p-8 lg:p-12 text-gray-800"
              variants={slideInFromRight}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-primary">OUR VISION</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg">
                To lead the interior design industry by transforming spaces with innovative materials and designs. We envision spaces that blend aesthetics with functionality, creating environments that inspire.
              </p>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                Our goal is to set new standards for excellence, delivering products that elevate every project.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Why Choose Us Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              We combine expertise, innovation, and dedication to deliver exceptional results
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants}>
            <motion.div
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-[#e03e3e] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Quality Craftsmanship</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">Premium plywood, mica, and teak with meticulous attention to detail.</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-[#e03e3e] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Innovative Technology</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">Explore products with our advanced AR and 3D visualization tools.</p>
            </motion.div>

            <motion.div
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group"
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-[#e03e3e] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Tailored Solutions</h3>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">Personalized designs for homeowners, architects, and dealers.</p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.div
            className="bg-gradient-to-r from-primary to-[#e03e3e] rounded-3xl p-8 sm:p-12 text-white"
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center"
              variants={containerVariants}
            >
              {[
                { value: "500+", label: "Happy Clients" },
                { value: "1000+", label: "Projects Completed" },
                { value: "13+", label: "Years Experience" },
                { value: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-red-100">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleUp}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl"
            whileHover={{ y: -5 }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6"
              variants={itemVariants}
            >
              Ready to Transform Your Space?
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Explore our premium plywood, mica, and teak products or contact us to bring your vision to life.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={containerVariants}
            >
              <motion.a
                href="/products"
                className="inline-block bg-gradient-to-r from-primary to-[#e03e3e] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:from-[#e03e3e] hover:to-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Products
              </motion.a>
              <motion.a
                href="/contact"
                className="inline-block border-2 border-gray-300 text-gray-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:border-primary hover:bg-red-50 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
      <Footer/>
    </div>
  );
};

export default About;