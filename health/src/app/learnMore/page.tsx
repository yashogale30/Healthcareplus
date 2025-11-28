"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

export default function LearnMore() {
  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        {/* Background Soft Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#64766A]/10 to-[#C0A9BD]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A] font-medium">
            <div className="w-2 h-2 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] rounded-full mr-3 animate-pulse"></div>
            Healthcare+ Suite
          </div>

          <h1 className="text-6xl md:text-7xl font-extralight tracking-tight text-[#64766A] mb-8">
            Learn More
          </h1>

          <p className="text-2xl text-[#64766A]/70 max-w-3xl mx-auto leading-relaxed font-light">
            Explore all the advanced wellness features designed to guide, support,
            and enhance your healthcare experience.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Feature Card Template */}
          {[
            {
              title: "Disease Prediction",
              desc: "AI analyzes your health data to predict potential risks before symptoms appear.",
              color: "#C0A9BD"
            },
            {
              title: "Nutrition Insights",
              desc: "Instant food image analysis with detailed nutritional breakdowns.",
              color: "#94A7AE"
            },
            {
              title: "Fitness Studio",
              desc: "Personalized AI-based workout plans that adapt to your goals and progress.",
              color: "#64766A"
            },
            {
              title: "Find Clinics Nearby",
              desc: "Discover nearby healthcare centres with real-time availability.",
              color: "#C0A9BD"
            },
            {
              title: "Mental Wellness",
              desc: "Track and improve your mental health with guided wellness programs.",
              color: "#94A7AE"
            },
            {
              title: "Period Calendar",
              desc: "Track cycles with smart predictions and comprehensive monitoring.",
              color: "#64766A"
            },
            {
              title: "Medicine Tracker",
              desc: "Never miss a dose with smart reminders and medication monitoring.",
              color: "#C0A9BD"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/90 backdrop-blur-lg p-10 rounded-[2rem] shadow-xl border border-[#C0A9BD]/20 hover:scale-[1.03] hover:shadow-2xl transition-all duration-500 relative overflow-hidden">

                {/* Soft Gradient Circle */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${feature.color}20, #ffffff20)` }}
                ></div>

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${feature.color}, #94A7AE)` }}
                    ></div>
                  </div>

                  <h2 className="text-3xl font-light text-[#64766A] mb-4">
                    {feature.title}
                  </h2>

                  <p className="text-[#64766A]/70 leading-relaxed text-lg font-light">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

      
      </section>

      <Footer />
    </div>
  );
}