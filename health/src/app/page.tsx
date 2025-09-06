import Link from "next/link";
import Navbar from "../components/navbar";
import diseaseIcon from "../app/assets/disease.png";
import calorie from "../app/assets/calorie.png"
import aiFitness from "../app/assets/aiFitness.png"
import clinics from "../app/assets/findClinics.png"
import mental from "../app/assets/mental.png"
import Footer from "../components/footer";


export default function Home() {
  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A]">
            <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
            AI-Powered Healthcare Platform
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light tracking-tight text-[#64766A] mb-8">
            HealthCare<span className="text-[#C0A9BD]">+</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#64766A]/80 max-w-3xl mx-auto leading-relaxed mb-12 font-light">
            Experience the future of healthcare with AI-powered disease prediction, 
            nutrition tracking, fitness coaching, and clinic discovery — all seamlessly 
            integrated into one intelligent platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/get-started"
              className="px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              href="/learn-more"
              className="px-8 py-4 bg-white/70 backdrop-blur-sm text-[#64766A] rounded-full text-lg font-medium hover:bg-white/90 transition-all duration-300 border border-[#C0A9BD]/30"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#C0A9BD] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#C0A9BD] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="min-h-screen py-24 px-6 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #64766A 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A] mb-6">
              Comprehensive Health Solutions
            </div>
            <h2 className="text-5xl md:text-6xl font-light text-[#64766A] mb-6 tracking-tight">
              Our Core Services
            </h2>
            <p className="text-xl text-[#64766A]/70 max-w-2xl mx-auto font-light">
              Discover how our AI-powered tools can transform your health journey
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Disease Prediction */}
            <Link href="/diseasePrediction">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={diseaseIcon.src}
                      alt="Disease Prediction"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Disease Prediction</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Advanced AI algorithms analyze your health data to predict potential diseases before symptoms appear.
                  </p>
                </div>
              </div>
            </Link>

            {/* Nutrition Value */}
            <Link href="/calorieTracker">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={calorie.src}
                      alt="Nutrition Tracking"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Nutrition Insights</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Instantly analyze food images to get comprehensive nutritional breakdowns and recommendations.
                  </p>
                </div>
              </div>
            </Link>

            {/* AI Fitness */}
            <Link href="/fitnessTrainer">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#64766A]/20 to-[#C0A9BD]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={aiFitness.src}
                      alt="AI Fitness Coach"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">AI Fitness Coach</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Personalized workout plans that adapt to your progress, preferences, and fitness goals.
                  </p>
                </div>
              </div>
            </Link>

            {/* Find Clinics */}
            <Link href="/findClinics">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={clinics.src}
                      alt="Find Clinics"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Find Clinics Nearby</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Locate nearby healthcare facilities with real-time availability and appointment booking.
                  </p>
                </div>
              </div>
            </Link>

            {/* Mental Health */}
            <Link href="/mentalHealth">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer md:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={mental.src}
                      alt="Mental Health"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Mental Wellness</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Monitor, track, and improve your mental health with AI-guided wellness programs.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-[#64766A] mb-6 tracking-tight">
            Ready to transform your health?
          </h2>
          <p className="text-xl text-[#64766A]/70 mb-12 font-light max-w-2xl mx-auto">
            Join thousands of users who are already experiencing the future of healthcare with our AI-powered platform.
          </p>
          <Link
            href="/get-started"
            className="inline-flex items-center px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Journey
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
