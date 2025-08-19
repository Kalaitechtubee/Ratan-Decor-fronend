import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiMessageSquare, FiPlus, FiMinus, FiHelpCircle } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import useScrollToTop from '../../hooks/useScrollToTop';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [openQuestions, setOpenQuestions] = useState(new Set([0])); // First question open by default
  
  const categories = [
    { id: 'Getting Started', name: 'Getting Started', icon: '🚀' },
    { id: 'Enquiry System', name: 'Enquiry System', icon: '📞' },
    { id: 'Account Management', name: 'Account Management', icon: '👤' },
    { id: 'Pricing & Roles', name: 'Pricing & Roles', icon: '💰' },
    { id: 'Augmented Reality (AR)', name: 'Augmented Reality (AR)', icon: '🥽' },
  ];

  useScrollToTop();
  const faqs = {
    'Getting Started': [
      {
        question: "How do I select my user type?",
        answer: "A popup will appear on your first visit requiring you to select Residential, Commercial, Modular Kitchen, or Others, and you cannot bypass it."
      },
      {
        question: "Can I change my user type later?",
        answer: "Yes, you can switch your view type at any time using the \"Change Type\" option in the website header."
      },
      {
        question: "What happens after selecting a user type?",
        answer: "The website content, including the home page and product views, will dynamically update based on your selection."
      },
      {
        question: "Are there static pages available?",
        answer: "Yes, static pages like About Us, Contact Us, Terms & Conditions, and Privacy Policy are shared across all user types."
      },
      {
        question: "How are product pages adapted?",
        answer: "Product pages are tailored based on your user type, with filterable categories and client-defined attributes."
      }
    ],
    'Enquiry System': [
      {
        question: "What enquiry options are available for products?",
        answer: "Each product offers Direct Call, WhatsApp, or Email Form, with an option to request a video call appointment."
      },
      {
        question: "How do I request a video call appointment?",
        answer: "Submit your preferred date and time; the support team will confirm availability or suggest an alternate time."
      },
      {
        question: "How are email enquiries processed?",
        answer: "Email Forms capture user information, are automatically stored in the admin panel, and marked as \"Email Enquiry\"."
      },
      {
        question: "How are Direct Call or WhatsApp enquiries handled?",
        answer: "These are manually entered in the backend by staff and marked as \"Phone\" or \"WhatsApp Enquiry\"."
      },
      {
        question: "Can I track the status of my enquiry?",
        answer: "Yes, the admin panel allows you to track enquiry status such as New, In Progress, Confirmed, Delivered, or Rejected."
      }
    ],
    'Account Management': [
      {
        question: "How do I access my account?",
        answer: "You can access your account from any device with internet access after registration."
      },
      {
        question: "What roles are available in the admin panel?",
        answer: "Roles include Admin, Manager, Sales, and Support, each with specific access permissions."
      },
      {
        question: "How is enquiry data integrated with CRM?",
        answer: "Enquiry data is sent to the CRM via API, with status updates retrieved and synchronized, remaining accessible if CRM is discontinued."
      },
      {
        question: "Can admins manage products?",
        answer: "Yes, admins can add/edit/delete products, assign categories, set visibility by user type, and enable/disable them."
      },
      {
        question: "What infrastructure support is provided?",
        answer: "We handle server setup, domain configuration, business email, and SSL installation for smooth operation."
      }
    ],
    'Pricing & Roles': [
      {
        question: "What pricing tiers are offered?",
        answer: "The platform supports General Customer (standard), Architect (discounted after verification), and Dealer (maximum discount) tiers."
      },
      {
        question: "How do I register as an Architect?",
        answer: "Select Architect during registration; the support team will verify manually before applying the discount."
      },
      {
        question: "How are Dealer accounts created?",
        answer: "Dealers are added by admins or submit a Dealer Request, which is approved to create the account."
      },
      {
        question: "What payment options are available?",
        answer: "Integration with a payment gateway (2% commission), plus Google Pay, UPI, and bank transfer with screenshot upload."
      },
      {
        question: "What features are in the customer dashboard?",
        answer: "Includes Profile Management and Order History; Architects and Dealers get additional savings insights."
      }
    ],
    'Augmented Reality (AR)': [
      {
        question: "What is the AR functionality?",
        answer: "AR allows customers to virtually place and view products in their room, office, or other spaces."
      },
      {
        question: "How does AR help customers?",
        answer: "It provides a real-time, interactive digital experience to visualize how products will look and fit in their environment."
      },
      {
        question: "Is AR available for all products?",
        answer: "AR functionality will be implemented for products where virtual placement is feasible, based on design."
      },
      {
        question: "Do I need special equipment for AR?",
        answer: "A compatible smartphone or device with a camera and AR support is required to use this feature."
      },
      {
        question: "How do I access AR on the website?",
        answer: "Look for the AR option on product detail pages, available after selecting your user type."
      }
    ]
  };

  const toggleQuestion = (index) => {
    const newOpenQuestions = new Set();
    if (openQuestions.has(index)) {
      newOpenQuestions.delete(index);
    } else {
      newOpenQuestions.add(index);
      // Close all other questions except the new one
      openQuestions.forEach(q => newOpenQuestions.delete(q));
      newOpenQuestions.add(index);
    }
    setOpenQuestions(newOpenQuestions);
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const categoryButtonVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: { 
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const accordionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const slideInVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-roboto">
      <Navbar/>
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FiHelpCircle className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to know about features, membership, and troubleshooting.
          </motion.p>
        </motion.div>

        {/* Main Content - Enhanced Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Side - Enhanced FAQ Categories */}
          <motion.div 
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/3 lg:sticky lg:top-8 lg:h-fit"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose any one</h2>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    variants={categoryButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center space-x-3 ${
                      activeCategory === category.id 
                        ? 'bg-gradient-to-l from-red-400 to-red-500 text-white shadow-lg transform scale-105' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-sm">{category.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Accordion Questions & Answers */}
          <motion.div 
            variants={itemVariants}
            className="w-full lg:w-2/3"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <motion.div 
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{activeCategory}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
              </motion.div>

              <div className="space-y-4">
                {faqs[activeCategory].map((faq, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <motion.button
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-all duration-200"
                      whileHover={{ backgroundColor: "#f9fafb" }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4 leading-relaxed">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openQuestions.has(index) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {openQuestions.has(index) ? (
                          <FiMinus className="text-red-500 h-5 w-5 flex-shrink-0" />
                        ) : (
                          <FiPlus className="text-gray-500 h-5 w-5 flex-shrink-0" />
                        )}
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {openQuestions.has(index) && (
                        <motion.div
                          variants={accordionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="px-6 pb-5 pt-2"
                        >
                          <p className="text-gray-600 leading-relaxed text-base">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Contact Support Section */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 p-8 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    Contact our support team and we will make sure everything is clear and intuitive for you!
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Contact Support
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div><br /><br />
      </motion.div>
      <Footer/>
    </div>
  );
};

export default FAQPage;