"use client";
import Link from "next/link";
import Navbar from "../components/navbar";
import diseaseIcon from "../app/assets/disease.png";
import calorie from "../app/assets/calorie.png"
import aiFitness from "../app/assets/aiFitness.png"
import clinics from "../app/assets/findClinics.png"
import mental from "../app/assets/mental.png"
import period from "../app/assets/period.png"
import medicine from "../app/assets/medicine.png"

import Footer from "../components/footer";
import { useAuth } from "../lib/authContext";

export default function Home() {
  const { user, signInWithGoogle, signOut } = useAuth();
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
            <div className="hidden lg:flex items-center space-x-4">
              
                <div className="flex items-center space-x-3">
                  <Link
                    href="/chatbotAgent"
                    className="px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Agentic AI
                  </Link>
                </div>
              
            </div>
            <Link

              href="/agent"


              className="px-8 py-4 bg-white/70 backdrop-blur-sm text-[#64766A] rounded-full text-lg font-medium hover:bg-white/90 transition-all duration-300 border border-[#C0A9BD]/30"
            >
              Chat with us!
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
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-12 h-12 text-[#64766A]"
                    >
                      <path d="M5.99715 12H35.9543V13.0956C36.6506 13.1985 37.3198 13.3824 37.9515 13.6371V10H4V34H19.9772V36H15.9829C15.4314 36 14.9843 36.4477 14.9843 37C14.9843 37.5523 15.4314 38 15.9829 38H25.9686C26.5201 38 26.9672 37.5523 26.9672 37C26.9672 36.4477 26.5201 36 25.9686 36H21.9743V34H37.9515V29.358C37.3196 29.6128 36.6504 29.7968 35.9543 29.8998V32H5.99715V21.3749H12.32L14.3574 18.0619L17.8165 25.0619L21.1599 19.6249H26.5854C26.7069 18.9226 26.9198 18.2517 27.2115 17.6249H20.0443L18.0069 20.938L14.5479 13.938L11.2045 19.3749H5.99715V12Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M34.8061 28C36.366 28 37.7973 27.449 38.9166 26.5307L42.5878 30.2071L44 28.7928L40.2514 25.0389C40.9127 24.0206 41.2968 22.8052 41.2968 21.5C41.2968 17.9101 38.3908 15 34.8061 15C31.2213 15 28.3154 17.9101 28.3154 21.5C28.3154 25.0899 31.2213 28 34.8061 28ZM34.8061 26C37.2878 26 39.2997 23.9853 39.2997 21.5C39.2997 19.0147 37.2878 17 34.8061 17C32.3243 17 30.3125 19.0147 30.3125 21.5C30.3125 23.9853 32.3243 26 34.8061 26Z" fill="currentColor"/>
                      <path d="M7.99429 26H13.9857V24H7.99429V26Z" fill="currentColor"/>
                      <path d="M7.99429 30V28H19.9772V30H7.99429Z" fill="currentColor"/>
                    </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0">
 <path d="m86.301 43.801h-0.39844c-0.89844-5.3984-3.3984-10.102-7.3008-13.801-3.6992-3.3984-7.6992-5.6016-11.699-6.3008-5.8984-1-8.6016 0.5-11.102 1.8008-1.3984 0.69922-2.6016 1.3984-4.3984 1.6016 0.10156-7.1992 2.1992-9.3984 5.6992-10.699 0.80078-0.30078 1.1992-1.1016 0.89844-1.8984-0.30078-0.80078-1.1016-1.1992-1.8984-0.89844-5.3984 2-7.6016 5.8984-7.6992 13.5-1.8008-0.19922-3-0.89844-4.3984-1.6016-2.3984-1.3008-5.1992-2.8008-11.102-1.8008-4 0.69922-8 2.8984-11.699 6.3008-1 0.89844-1.8984 1.8984-2.6992 3h-5c-4.6055-0.003906-8.5039 3.8945-8.5039 8.6953v13.102c0 4.8008 3.8984 8.6992 8.6992 8.6992h3.1016c3.3984 8.3008 9.1992 15.801 16.199 19.898 5.8984 3.5 11.898 3.8984 17 1.3008 2.1992 1.1992 4.6016 1.6992 7 1.6992 6.6992 0 13.898-4.3008 20-12.199h9.3008c4.8008 0 8.6992-3.8984 8.6992-8.6992v-13c0-4.8008-3.8984-8.6992-8.6992-8.6992zm-62.801-11.602c3.1992-3 6.6992-4.8984 10.102-5.5 4.8008-0.89844 6.8008 0.19922 9.1016 1.3984 1.5 0.80078 3.1992 1.6992 5.8008 2l-0.003906 9.9023c-1.8008-0.10156-3.5-0.5-5.1992-1.1016v-2.8984c0-1.6016-1.3008-2.8984-2.8984-2.8984h-17.703c0.19922-0.40234 0.5-0.60156 0.80078-0.90234zm-15.5 9.5c0-2.8984 2.1992-5.3008 5-5.6992v4c0 0.80078 0.69922 1.5 1.5 1.5s1.5-0.60156 1.5-1.5v-4h6.1016v2.8984c0 0.80078 0.69922 1.5 1.5 1.5 0.80078 0 1.5-0.69922 1.5-1.5v-2.8984h6.1016l-0.003906 4c0 0.80078 0.69922 1.5 1.5 1.5s1.5-0.69922 1.5-1.5v-4h6.1016l0.10156 10.199h-26.703c-2.1992 0-4.1992 0.80078-5.6992 2.1016zm5.6992 18.902c-3.0977 0-5.6992-2.6016-5.6992-5.8008s2.6016-5.6992 5.6992-5.6992c0 3.8008 0.69922 7.6992 2 11.5zm37.102 21.199c-0.5-0.30078-1.1016-0.30078-1.5 0-5.5 3.3008-11 1.3008-14.699-0.80078-9.8984-5.8008-17.602-19.801-17.801-31.801h23.602c1.6016 0 2.8984-1.3008 2.8984-2.8984v-4.1016c2.1992 0.69922 4.3008 1 6.6992 1 4.8008 0 8.1992-1.3008 11.699-3.1992 0.69922-0.39844 1-1.3008 0.60156-2-0.39844-0.69922-1.3008-1-2-0.60156-2.8008 1.5-5.3984 2.5-8.8008 2.8008v-9.8984c2.5-0.30078 4.3008-1.1992 5.8008-2 2.3008-1.1992 4.3008-2.3008 9.1016-1.3984 3.3984 0.60156 6.8984 2.5 10.102 5.5 6.5 6 8.3984 15.5 5.3008 26l-38.105-0.003906c-1.6016 0-2.8984 1.3008-2.8984 2.8984v10.199c0 1.6016 1.3008 2.8984 2.8984 2.8984h29.5c-5.8984 6.707-14.598 12.004-22.398 7.4062zm41.199-16.199c0 3.1992-2.6016 5.6992-5.6992 5.6992l-42.5 0.10156-0.10156-10.199h6.1992v2.8984c0 0.80078 0.69922 1.5 1.5 1.5 0.80078 0 1.5-0.69922 1.5-1.5v-2.8984l6.1016-0.003906v4c0 0.80078 0.69922 1.5 1.5 1.5s1.5-0.69922 1.5-1.5v-4h6.1016v2.8984c0 0.80078 0.69922 1.5 1.5 1.5 0.80078 0 1.5-0.69922 1.5-1.5v-2.8984h6.1016v4c0 0.80078 0.69922 1.5 1.5 1.5s1.5-0.69922 1.5-1.5v-4h6.1016c2.1992 0 4.1992-0.80078 5.6992-2.1016zm-5.6992-7.4023h-1.3008c1.1016-4 1.5-7.8008 1.1992-11.5h0.10156c3.1992 0 5.6992 2.6016 5.6992 5.6992 0 3.1016-2.6016 5.8008-5.6992 5.8008z"/>
<text x="0.0" y="117.5" fontSize="5.0" fontWeight="bold" fontFamily="Arbeit Regular, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000"></text><text x="0.0" y="122.5" fontSize="5.0" fontWeight="bold" fontFamily="Arbeit Regular, Helvetica, Arial-Unicode, Arial, Sans-serif" fill="#000000"></text></svg>
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
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M31 14C31 13.4477 31.4477 13 32 13H36C36.5523 13 37 13.4477 37 14V16H40C40.5523 16 41 16.4477 41 17V23H44V25H41V31C41 31.5523 40.5523 32 40 32H37V34C37 34.5523 36.5523 35 36 35H32C31.4477 35 31 34.5523 31 34V25H17V34C17 34.5523 16.5523 35 16 35H12C11.4477 35 11 34.5523 11 34V32H8C7.44772 32 7 31.5523 7 31V25H4V23H7V17C7 16.4477 7.44772 16 8 16H11V14C11 13.4477 11.4477 13 12 13H16C16.5523 13 17 13.4477 17 14V23H31V14ZM13 33H15V15H13V33ZM11 18H9V30H11V18ZM37 30V18H39V30H37ZM35 15V33H33V15H35Z" fill="currentColor"/>
</svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Fitness Studio</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Personalized workout plans that intelligently adapt to your progress, preferences, and fitness goals
                  </p>
                </div>
              </div>
            </Link>

            {/* Find Clinics */}
            <Link href="/findClinics">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20 20H16V23H20V20Z" fill="currentColor"/>
<path d="M16 25H20V28H16V25Z" fill="currentColor"/>
<path d="M20 30H16V33H20V30Z" fill="currentColor"/>
<path d="M22 20H26V23H22V20Z" fill="currentColor"/>
<path d="M26 25H22V28H26V25Z" fill="currentColor"/>
<path d="M22 30H26V33H22V30Z" fill="currentColor"/>
<path d="M32 20H28V23H32V20Z" fill="currentColor"/>
<path d="M28 25H32V28H28V25Z" fill="currentColor"/>
<path d="M32 30H28V33H32V30Z" fill="currentColor"/>
<path d="M25 15V12H28V10H25V7H23V10H20V12H23V15H25Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M17 6C17 4.89543 17.8954 4 19 4H29C30.1046 4 31 4.89543 31 6H39V8H37V42H39C39.5523 42 40 42.4477 40 43C40 43.5523 39.5523 44 39 44H9C8.44772 44 8 43.5523 8 43C8 42.4477 8.44772 42 9 42H11V8H10V6L17 6ZM17 11L13 11V42H17V38H16V36H32V38H31V42H35V11H31V16C31 17.1046 30.1046 18 29 18H19C17.8954 18 17 17.1046 17 16V11ZM17 9L13 9V8H17V9ZM19 6H29V16H19V6ZM23 42H19V38H23V42ZM29 42V38H25V42H29ZM35 9V8H31V9H35Z" fill="currentColor"/>
</svg>

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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -5 85 85" fill="currentColor">
  <g>
    <path d="M10.1,35.4c-0.4,0.5-0.8,0.9-1.3,1.4c-2,2.1-1.5,4.3,0.5,5.4c0.7,0.4,1.8,0.6,1.9,0.8c0.3,0.5-1.8,2.7-0.4,4.5 c0.2,0.2,0.4,0.4,0.7,0.6c-0.2,0.3-0.3,0.7-0.2,1c0,1.7,2,2.2,2.3,3c0.4,0.9-0.9,2.3-0.6,4c-0.2,1.8,1.2,3.5,3.2,3.9 c1.7,0.4,3.5-0.1,7.9-1.1c2.4,1.5,4.1,4,5.4,6.6c0.3,0.6,0.8,1.4,1.5,1.4c0.4,0,0.7-0.3,0.9-0.7c0,0,0.1,0,0.1,0 c0.4-0.2,0.5-0.6,0.4-1c-1.9-4.1-3.9-6.2-4.6-7.2c2.3-0.6,4.7-1.2,6.5-2.6c3-2.3,4-6.1,4.6-9.8c0.1-0.2,0.3-0.4,0.5-0.6 c0.3-0.3,0.3-0.8,0-1.1c-0.3-0.3-0.8-0.3-1.1,0c-1.3,1.3-1.7,3-2.1,4.6c-0.9,3.6-1.5,4.6-5.5,6c-4.2,1.4-7.9,2.4-11.3,3 c-1.1,0.2-2.3,0.3-3.3,0c-0.8-0.3-1.7-1-1.7-1.9c0-1.1,1.2-2.6,0.5-4.1c-0.6-1.2-2.2-1.6-2.2-2.4c0-0.2,0.2-0.5,0.4-0.6 c0.7-0.3,0.5-1.3-0.2-1.4c-0.4-0.1-0.7-0.3-0.9-0.5c-0.8-1,1.3-2.7,0.6-4.3c-0.5-1-1.8-1-2.5-1.4C8.7,40.1,8.9,39,10,37.8 c0.4-0.5,0.9-1,1.3-1.4c1.4-1.6,2.9-2.9,3.2-4.8c0.2-0.9,0-1.9-0.4-2.7c-0.5-0.8-0.7-1.6-0.5-2.3C15.3,16,17.6,10.8,28.1,8.5 c13.6-3,24.4,2.3,28.7,10.6c2.6,4.9,2.7,11,0.1,15.5c-0.7,1.3-1.7,2.5-2.6,3.7c-1.1,1.4-2.2,2.9-3,4.5c-1.5,3-2,6.7-1.4,10.7 c0.5,3.6,1.6,7,2.8,10.3c0.1,0.3,0.4,0.5,0.7,0.5c0.1,0,0.2,0,0.2,0c0.4-0.1,0.6-0.6,0.5-1c-1.1-3.2-2.2-6.6-2.7-10 c-0.5-3.7,0-7.1,1.3-9.8c0.8-1.5,1.8-2.8,2.9-4.2c1-1.2,1.9-2.5,2.7-3.9c2.8-4.9,2.7-11.6-0.1-17C53.5,9.5,42.1,3.9,27.8,7.1 c-11.2,2.4-13.9,8.2-15.8,19.3c-0.2,1,0.1,2.1,0.7,3.3c0.3,0.5,0.4,1.1,0.3,1.7C12.7,32.8,11.4,33.9,10.1,35.4z"/>
    <path d="M19.2,29.5c0.3,1.7,1.6,3.5,3.3,4.3c1.8,0.9,5.5,0.9,7.5-0.5c3.1,2.2,7.1,2.1,10.1-0.1c0.5,1.2,0.8,2.5,1.1,4 c0.6,2.7,0.7,3.6,1.4,3.6c1.3,0,1.4,0,1.6-0.1c0.3-0.1,0.4-0.3,0.5-0.6c0.2-1.9,1.2-4.6,1.9-6.6c0.6-0.1,1.2-0.3,1.8-0.6 c2.5-1.3,4-4.1,3.7-6.9c-0.3-2.5-2-4.8-4.4-5.7c0.8-4.6-5.4-8.7-9.6-8.7c0,0,0,0,0,0c-2.1,0-4.1,0.9-5.2,2.3 c-1.8-1.6-4.7-1.9-7.1-0.8c-2.3,1.1-4.1,3.3-5,6.2c-0.6,1.9-0.7,4,0.6,5.5C19.9,26,19,27.7,19.2,29.5z M21.4,26.9 c0.2-0.3,0.8-0.9,1.1-1c0.3,0,0.6-0.1,0.8-0.4c0,0,0,0,0-0.1c0.6-0.5,1.7-0.1,2.4,0.4c0.1,0.1,0.3,0.1,0.4,0.1c0.7,0,1-0.9,0.4-1.4 c-1.2-0.8-2.8-1.2-4-0.5c-1.1-1.1-0.9-2.8-0.5-4.3c0.8-2.5,2.3-4.4,4.2-5.3c2-1,4.5-0.5,5.8,0.9c-0.2,1.6,0.2,3.2,1.1,4.5 c0.1,0.2,0.4,0.3,0.6,0.3c0.1,0,0.3,0,0.4-0.1c0.3-0.2,0.4-0.7,0.2-1c-0.7-1-1-2.3-0.8-3.5c0-0.1,0-0.1,0-0.2 c0.8-1.4,2.5-2.3,4.4-2.3c0,0,0,0,0,0c3.7,0,9.3,3.9,8,7.5c-0.1,0.4,0.1,0.9,0.5,1c2.1,0.5,3.8,2.5,4,4.6c0.2,2.1-1,4.4-2.9,5.4 c-1.4,0.7-2.1,0.3-2.4,1c-0.6,1.9-1.7,4.5-2,6.7c0,0-0.1,0-0.1,0c-0.7-2.5-0.9-5.3-2.2-7.6c0,0,0,0,0,0c-0.1-0.6,0.1-1.2,0.5-1.6 c0.3-0.3,0.3-0.8,0-1.1c-0.3-0.3-0.8-0.3-1.1,0c-0.7,0.7-1,1.7-0.9,2.7c-2.8,2.2-6.5,2.1-9.1,0c-0.3-0.3-0.8-0.2-1,0.1 c-1.1,1.2-4.6,1.4-6.2,0.6c-1.3-0.6-2.5-2.2-2.5-3.6C20.7,28.3,21,27.5,21.4,26.9z"/>
    <path d="M32.4,26.6c0.5,0.1,1.2,0.3,1.8,0.3c1.2,0,2.3-0.7,2.6-1.8c0.1-0.4-0.2-0.8-0.6-0.9c-0.4-0.1-0.8,0.2-0.9,0.6 c-0.1,0.3-0.4,0.5-0.8,0.6c-0.5,0.1-1.1-0.1-1.7-0.3c-0.4-0.1-0.8,0.1-0.9,0.5C31.8,26.1,32,26.5,32.4,26.6z"/>
    <path d="M43.3,24.7c0.3-0.3,0.4-0.7,0.1-1.1c-0.5-0.5-0.6-1.4-0.3-2c0.2-0.4,0-0.8-0.4-1c-0.4-0.2-0.8,0-1,0.4 c-0.5,1.2-0.3,2.6,0.5,3.6C42.5,25,43,25,43.3,24.7z"/>
    <path d="M49.5,5.4L50.2,2c0.1-0.4-0.2-0.8-0.6-0.9c-0.4-0.1-0.8,0.2-0.9,0.6l-0.6,3.3C48,5.5,48.3,5.9,48.7,6 C49.1,6,49.5,5.8,49.5,5.4z"/>
    <path d="M53,6.9c0.3-0.8,0.7-1.5,1.3-2.1c0.3-0.3,0.3-0.8,0-1.1c-0.3-0.3-0.8-0.3-1.1,0c-0.7,0.8-1.2,1.7-1.6,2.6 c-0.1,0.4,0.1,0.8,0.5,1C52.5,7.5,52.9,7.3,53,6.9z"/>
    <path d="M55.1,9.5c0.1,0.4,0.5,0.7,0.9,0.6c1.1-0.2,2.2-0.7,3-1.5c0.3-0.3,0.4-0.7,0.1-1.1c-0.3-0.3-0.7-0.4-1.1-0.1 c-0.7,0.6-1.5,1-2.4,1.1C55.3,8.7,55,9.1,55.1,9.5z"/>
  </g>
</svg>

                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Mental Wellness</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                    Monitor, track, and improve your mental health with AI-guided wellness programs.
                  </p>
                </div>
              </div>
            </Link>

            {/* Period Tracker */}
            <Link href="/period_tracker">
              <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer md:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={period.src}
                      alt="Period Calender"
                      className="w-12 h-12"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#64766A] mb-3">Period Calender</h3>
                  <p className="text-[#64766A]/70 leading-relaxed">
                   Track your period cycles with predictions and comprehensive health monitoring
                  </p>
                </div>
              </div>
            </Link>

            {/* Medicine Tracker */}
            {/* Medicine Tracker - Centered in bottom row */}
<div className="md:col-span-2 lg:col-span-3 flex justify-center">
  <Link href="/medicine" className="w-full max-w-md">
    <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-[#C0A9BD]/20 hover:border-[#C0A9BD]/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <img
            src={medicine.src}
            alt="medicine"
            className="w-12 h-12"
          />
        </div>
        <h3 className="text-xl font-semibold text-[#64766A] mb-3">Medicine Tracker</h3>
        <p className="text-[#64766A]/70 leading-relaxed">
         Never miss a dose, stay on track with ease.
        </p>
      </div>
    </div>
  </Link>
</div>

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
          <div className="hidden lg:flex items-center justify-center space-x-4">
            {!user ? (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Your Journey
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            ) : (
              <Link
                href="/profile"
                className="inline-flex items-center px-8 py-4 bg-[#64766A] text-white rounded-full text-lg font-medium hover:bg-[#64766A]/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Your Journey
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
