import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const allProducts = [
  {
    id: 1,
    name: 'Walnut Veneer',
    category: 'Wood',
    subcategory: 'Walnut',
    description: 'Rich brown tone with natural wood grain.',
    originalPrice: 2499,
    offerPrice: 2199,
    image: 'src/assets/images/prolist1.jpg',
  },
  {
    id: 2,
    name: 'Teak Veneer',
    category: 'Wood',
    subcategory: 'Teak',
    description: 'Classic golden hue for premium interiors.',
    originalPrice: 2899,
    offerPrice: 2599,
    image: 'src/assets/images/prolist2.jpg',
  },
  {
    id: 3,
    name: 'Maple Veneer',
    category: 'Wood',
    subcategory: 'Maple',
    description: 'Smooth, light tone perfect for modern design.',
    originalPrice: 2699,
    offerPrice: 2399,
    image: 'src/assets/images/prolist3.jpg',
  },
  {
    id: 4,
    name: 'White Marble Veneer',
    category: 'Stone',
    subcategory: 'Marble',
    description: 'Elegant white finish for luxury interiors.',
    originalPrice: 3499,
    offerPrice: 2999,
    image: 'src/assets/images/prolist4.jpg',
  },
  {
    id: 5,
    name: 'Black Slate Veneer',
    category: 'Stone',
    subcategory: 'Slate',
    description: 'Bold black slate for modern spaces.',
    originalPrice: 3099,
    offerPrice: 2799,
    image: 'src/assets/images/prolist1.jpg',
  },
  {
    id: 6,
    name: 'Oak Veneer',
    category: 'Wood',
    subcategory: 'Oak',
    description: 'Strong texture with timeless appeal.',
    originalPrice: 3199,
    offerPrice: 2899,
    image: 'src/assets/images/prolist2.jpg',
  },
  {
    id: 7,
    name: 'Rosewood Veneer',
    category: 'Wood',
    subcategory: 'Rosewood',
    description: 'Dark luxury finish with fine grain.',
    originalPrice: 4999,
    offerPrice: 4599,
    image: 'src/assets/images/prolist3.jpg',
  },
  {
    id: 8,
    name: 'Granite Stone Veneer',
    category: 'Stone',
    subcategory: 'Granite',
    description: 'Natural stone for bold designs.',
    originalPrice: 5999,
    offerPrice: 5499,
    image: 'src/assets/images/prolist4.jpg',
  },
];

const categories = [
  {
    name: 'Wood',
    subcategories: ['Walnut', 'Teak', 'Maple', 'Oak', 'Rosewood'],
  },
  {
    name: 'Stone',
    subcategories: ['Marble', 'Slate', 'Granite'],
  },
];

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [sort, setSort] = useState('default');
  const [priceRange, setPriceRange] = useState(20000);
  const [visibleCount, setVisibleCount] = useState(6);

  const toggleCategory = (name) => {
    setExpandedCategory((prev) => (prev === name ? null : name));
  };

  const toggleSubcategory = (sub) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub)
        ? prev.filter((item) => item !== sub)
        : [...prev, sub]
    );
  };

  const filtered = allProducts
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => selectedSubcategories.length === 0 || selectedSubcategories.includes(p.subcategory))
    .filter((p) => p.offerPrice <= priceRange)
    .sort((a, b) => {
      if (sort === 'lowToHigh') return a.offerPrice - b.offerPrice;
      if (sort === 'highToLow') return b.offerPrice - a.offerPrice;
      return 0;
    });

  const visibleProducts = filtered.slice(0, visibleCount);

  return (
    <>
      <Navbar/>
      <div className="flex flex-col lg:flex-row gap-10 p-6 max-w-7xl mx-auto">
      
        {/* Sidebar */}
        <aside className="lg:w-1/4 space-y-6 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg shadow-sm"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Price Range (Max ₹{priceRange})
            </label>
            <input
              type="range"
              min={10}
              max={20000}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full accent-pink-500"
            />
            <p className="text-center text-sm mt-2 text-primary">
              ₹10 – ₹{priceRange}
            </p>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Product Categories</label>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.name}>
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full text-left font-medium text-gray-700 flex justify-between items-center"
                  >
                    {cat.name}
                    <span>{expandedCategory === cat.name ? '−' : '+'}</span>
                  </button>
                  {expandedCategory === cat.name && (
                    <ul className="pl-4 mt-2 space-y-1 text-sm text-gray-600">
                      {cat.subcategories.map((sub) => (
                        <li key={sub}>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedSubcategories.includes(sub)}
                              onChange={() => toggleSubcategory(sub)}
                              className="accent-pink-500"
                            />
                            <span>{sub}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg shadow-sm"
            >
              <option value="default">Default</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {visibleProducts.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                  <p className="text-gray-500 text-sm">{product.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <span className="text-gray-800 mr-2 font-semibold text-lg">
                        ₹{product.offerPrice}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        ₹{product.originalPrice}
                      </span>
                    </div>
                    <button className="bg-primary text-white px-4 py-1 rounded-full hover:bg-primary text-sm transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + 3)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-all"
                >
                Load More Products
              </button>
            </div>
          )}
        
        </main>
      
      </div>
      <Footer/>
    </>
  );
};

export default ProductList;
