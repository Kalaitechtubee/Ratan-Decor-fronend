

import React from 'react';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HomeSlider from '../components/HomeSlider'
import AllProduct from '../components/AllProduct'


const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <HomeSlider />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-17">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Welcome to <span className="text-gray-800">Ratan Decor</span>
          </h1>
          
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Ratan Decor is your one-stop destination for premium interior products tailored for
            Residential, Commercial, and Modular Kitchen spaces. Explore our product range, submit
            enquiries, and experience our Augmented Reality preview feature!
          </p>

          {/* product page */}

          <AllProduct/>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md">
              Explore Products
            </button>
            <button className="px-6 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">
              Book Consultation
            </button>
          </div>
        </div>

        {/* Featured Image with AR Badge */}
        <div className="mt-12 relative">
          <img
            src="src/assets/images/slider1.jpg"
            alt="Interior Showcase"
            className="mx-auto rounded-xl shadow-xl w-full max-w-4xl"
          />
          <div className="absolute -bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm">
            Try AR Preview ↗
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🏡',
              title: 'Residential Solutions',
              description: 'Beautiful designs for homes and apartments'
            },
            {
              icon: '🏢',
              title: 'Commercial Spaces',
              description: 'Professional interiors for businesses'
            },
            {
              icon: '🍽️',
              title: 'Modular Kitchens',
              description: 'Smart and functional kitchen designs'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-primary"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-primary/5 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">What Our Clients Say</h2>
          <div className="bg-white p-8 rounded-xl shadow-md relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white w-10 h-10 flex items-center justify-center rounded-full">
              ❝
            </div>
            <p className="text-gray-700 italic text-lg mb-4">
              "Ratan Decor transformed our office space completely. Their attention to detail and quality products are unmatched in the industry."
            </p>
            <p className="font-medium text-primary">- Rajesh Sharma, Mumbai</p>
          </div>
        </div>
      </div>
       <Footer/>
    </div>
   
  )
}

export default Home

