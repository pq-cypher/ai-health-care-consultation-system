import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Heart,
  Shield,
  Clock,
  Users,
  Stethoscope,
  Brain,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  Star,
  Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import fmcLogo from "../../assets/images/fmc-logo.png";
import fmcGate from "../../assets/images/fmc-keffi-gate.webp";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: "AI-Powered Diagnosis",
      description: "Advanced artificial intelligence provides initial health assessments and recommendations based on your symptoms."
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "24/7 Availability",
      description: "Get health consultations anytime, anywhere. Our AI system is always ready to help with your health concerns."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Secure & Private",
      description: "Your health information is completely secure and confidential. We follow strict medical privacy protocols."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Professional Referrals",
      description: "When needed, the system connects you with qualified healthcare professionals at Federal Medical Center Keffi."
    }
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img className='h-[40px]' src={fmcLogo} />
              <div>
                <h1 className="text-lg font-bold text-gray-900">FMC Keffi</h1>
                <p className="text-xs text-gray-600">AI Health Consultation System</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <NavLink to={"/chat"} className="text-gray-700 hover:text-blue-600 transition-colors">Consultation</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden">
        {/* Hero Section */}
        <section id="home" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold text-gray-900 mb-6">AI Healthcare Consultation System</h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Get instant health consultations with our advanced AI system.
                  Receive personalized recommendations and connect with healthcare
                  professionals at Federal Medical Center Keffi when needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <NavLink to={"/chat"}
                    className="bg-green-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Consultation
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                </div>
              </div>
              <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-300 to-green-700 rounded-2xl p-8 shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Healthcare Technology"
                      className="rounded-lg shadow-lg w-full h-64 object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-2 bg-white p-4 rounded-xl shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="font-semibold text-gray-800">24/7 Active</p>
                        <p className="text-sm text-gray-600">AI Consultation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our AI Healthcare Consultation System?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the future of healthcare with our intelligent consultation system
                designed to provide immediate, accurate, and personalized health guidance.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={fmcGate}
                  alt="Federal Medical Center Keffi"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  About Federal Medical Center Keffi
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Federal Medical Center Keffi is committed to providing healthcare
                  services to our community. Our AI Healthcare Consultation System represents
                  our dedication to innovation and accessible healthcare for all.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-gray-700">Advanced AI diagnostic capabilities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-gray-700">Integration with professional healthcare</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-gray-700">Secure and confidential consultations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-500 to-green-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Your Health Journey?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our AI healthcare consultation system
              for their health needs. Get started with a free consultation today.
            </p>
            <NavLink
              to={"/chat"}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center group"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Free Consultation
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Contact Us</h2>
                <p className="text-gray-300 mb-8">
                  Have questions about our AI healthcare consultation system?
                  We're here to help you get the support you need.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">+234 905 750 8163</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">pr@fmckeffi.gov.ng</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-blue-400" />
                    <span className="text-gray-300">Federal Medical Center, Keffi, Nasarawa State</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img className='h-[40px] bg-white rounded-full' src={fmcLogo} />
                <div>
                  <h3 className="text-lg font-bold">FMC Keffi AI Healthcare</h3>
                  <p className="text-sm text-gray-400">Advanced Healthcare Consultation</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                © 2025 Federal Medical Center Keffi. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;