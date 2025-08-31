"use client";

import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FitnessTrainerHome() {
  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#64766A]/10 to-[#C0A9BD]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A] font-medium">
            <div className="w-2 h-2 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] rounded-full mr-3 animate-pulse"></div>
            Personal Fitness Solutions
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extralight tracking-tight text-[#64766A] mb-8 leading-tight">
            Fitness <span className="text-[#C0A9BD] font-light">Studio</span>
          </h1>
          
          <p className="text-2xl text-[#64766A]/70 max-w-3xl mx-auto leading-relaxed font-light">
            Transform your fitness journey with personalized training programs and comprehensive progress monitoring.
          </p>
        </div>
      </section>

      {/* Main Content - Split Layout */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Planner Section */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] border border-[#C0A9BD]/20 shadow-2xl p-10 h-full relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
                {/* Elegant Background Pattern */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#C0A9BD]/15 to-[#94A7AE]/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#94A7AE]/10 to-[#64766A]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-2xl shadow-lg"></div>
                    </div>
                    
                    <h2 className="text-4xl font-light text-[#64766A] mb-6 tracking-tight">
                      Training Programs
                    </h2>
                    
                    <p className="text-[#64766A]/70 leading-relaxed text-lg font-light">
                      Design custom workout routines and nutrition plans tailored to your specific goals, 
                      fitness level, and lifestyle preferences with our intelligent planning system.
                    </p>
                  </div>
                  
                  <div className="mt-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded-2xl p-4 border border-[#C0A9BD]/15 backdrop-blur-sm">
                        <div className="text-[#C0A9BD] font-semibold text-sm mb-1">Custom Routines</div>
                        <div className="text-[#64766A]/60 text-xs">Tailored Workouts</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-[#C0A9BD]/15 backdrop-blur-sm">
                        <div className="text-[#C0A9BD] font-semibold text-sm mb-1">Smart Planning</div>
                        <div className="text-[#64766A]/60 text-xs">Adaptive Coaching</div>
                      </div>
                    </div>
                    
                    <Link href="/fitnessTrainer">
                      <button className="w-full px-8 py-5 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-2xl text-lg font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform">
                        Start Planning
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tracker Section */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-[2rem] border border-[#94A7AE]/20 shadow-2xl p-10 h-full relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
                {/* Elegant Background Pattern */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-bl from-[#94A7AE]/15 to-[#64766A]/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tl from-[#64766A]/10 to-[#C0A9BD]/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#94A7AE] to-[#64766A] rounded-2xl shadow-lg"></div>
                    </div>
                    
                    <h2 className="text-4xl font-light text-[#64766A] mb-6 tracking-tight">
                      Progress Analytics
                    </h2>
                    
                    <p className="text-[#64766A]/70 leading-relaxed text-lg font-light">
                      Monitor your fitness evolution with comprehensive tracking tools. 
                      Visualize achievements, analyze performance trends, and maintain motivation through detailed insights.
                    </p>
                  </div>
                  
                  <div className="mt-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded-2xl p-4 border border-[#94A7AE]/15 backdrop-blur-sm">
                        <div className="text-[#94A7AE] font-semibold text-sm mb-1">Live Metrics</div>
                        <div className="text-[#64766A]/60 text-xs">Real-time Data</div>
                      </div>
                      <div className="bg-white/70 rounded-2xl p-4 border border-[#94A7AE]/15 backdrop-blur-sm">
                        <div className="text-[#94A7AE] font-semibold text-sm mb-1">Deep Analytics</div>
                        <div className="text-[#64766A]/60 text-xs">Performance Insights</div>
                      </div>
                    </div>
                    
                    <Link href="/fitnessTracker">
                      <button className="w-full px-8 py-5 bg-gradient-to-r from-[#C0A9BD] to-[#C0A9BD]/90 text-white rounded-2xl text-lg font-medium hover:from-[#C0A9BD]/90 hover:to-[#C0A9BD]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl transform">
                        Monitor Progress
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-extralight text-[#64766A] mb-6 tracking-tight">
              Complete Wellness Platform
            </h3>
            <p className="text-xl text-[#64766A]/60 max-w-3xl mx-auto font-light leading-relaxed">
              Everything you need to achieve your fitness goals in one sophisticated, integrated platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#C0A9BD]/15 p-8 text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/90">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-xl"></div>
                </div>
                <h4 className="text-xl font-medium text-[#64766A] mb-3">Goal Achievement</h4>
                <p className="text-[#64766A]/60 font-light leading-relaxed">Strategic milestone planning and achievement tracking for sustained progress</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#94A7AE]/15 p-8 text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/90">
                <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#94A7AE] to-[#64766A] rounded-xl"></div>
                </div>
                <h4 className="text-xl font-medium text-[#64766A] mb-3">Nutrition Guidance</h4>
                <p className="text-[#64766A]/60 font-light leading-relaxed">Personalized nutrition strategies and meal planning for optimal performance</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#64766A]/15 p-8 text-center hover:shadow-xl transition-all duration-500 hover:scale-105 hover:bg-white/90">
                <div className="w-16 h-16 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#64766A] to-[#C0A9BD] rounded-xl"></div>
                </div>
                <h4 className="text-xl font-medium text-[#64766A] mb-3">Performance Analytics</h4>
                <p className="text-[#64766A]/60 font-light leading-relaxed">Comprehensive reporting and performance analysis for continuous improvement</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
