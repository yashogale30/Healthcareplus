import Link from "next/link";
import Navbar from "../components/navbar";
import diseaseIcon from "../app/assets/disease.png";
import calorie from "../app/assets/calorie.png"
import aiFitness from "../app/assets/aiFitness.png"
import clinics from "../app/assets/findClinics.png"
import mental from "../app/assets/mental.png"
export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-28 bg-gradient-to-b from-white to-gray-100">
        <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">
          HealthCare+ Platform
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered disease prediction, nutrition tracking, fitness coaching,
          and clinic finder — all in one platform to keep you healthier.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/get-started"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/learn-more"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-300 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Hero Image
      <div className="max-w-5xl mx-auto px-6 -mt-6">
        <img
          src="https://via.placeholder.com/1000x500"
          alt="Landing"
          className="rounded-2xl shadow-2xl border border-gray-200"
        />
      </div> */}

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold text-center mb-16 text-black">
          Our Core Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Disease Prediction */}
          <Link href="/diseasePrediction">
            <div className="group bg-white flex flex-col items-center text-center p-8 shadow-md rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <img
                src={diseaseIcon.src}
               alt="Disease"
                className="h-70 mb-6 group-hover:scale-110 transition"
              />
              <h4 className="font-semibold text-lg">Disease Prediction</h4>
              <p className="text-gray-500 text-sm mt-2">
                Predict diseases using AI-driven health analysis.
              </p>
            </div>
          </Link>

          {/* Nutrition Value */}
          <Link href="/calorieTracker">
            <div className="group bg-white flex flex-col items-center text-center p-8 shadow-md rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <img
                src={calorie.src}
                alt="Nutrition"
                className="h-70 mb-6 group-hover:scale-110 transition"
              />
              <h4 className="font-semibold text-lg">Nutrition Value</h4>
              <p className="text-gray-500 text-sm mt-2">
                Get detailed nutrition insights from food images.
              </p>
            </div>
          </Link>

          {/* AI Fitness */}
          <Link href="/fitnessTrainer/tracker">
            <div className="group bg-white flex flex-col items-center text-center p-8 shadow-md rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <img
                src={aiFitness.src}
                alt="Fitness"
                className="h-70 mb-6 group-hover:scale-110 transition"
              />
              <h4 className="font-semibold text-lg">AI Fitness Coach</h4>
              <p className="text-gray-500 text-sm mt-2">
                Personalized AI-powered workout plans just for you.
              </p>
            </div>
          </Link>

          {/* Find Clinics */}
          <Link href="/findClinics">
            <div className="group bg-white flex flex-col items-center text-center p-8 shadow-md rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <img
                src={clinics.src}
                alt="Clinic"
                className="h-70 mb-6 group-hover:scale-110 transition"
              />
              <h4 className="font-semibold text-lg">Find Clinics Nearby</h4>
              <p className="text-gray-500 text-sm mt-2">
                Instantly locate nearby hospitals & clinics.
              </p>
            </div>
          </Link>

          {/* Mental State */}
          <Link href="/mentalHealth">
            <div className="group bg-white flex flex-col items-center text-center p-8 shadow-md rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer">
              <img
                src={mental.src}
                alt="Mental"
                className="h-70 mb-6 group-hover:scale-110 transition"
              />
              <h4 className="font-semibold text-lg">Mental State</h4>
              <p className="text-gray-500 text-sm mt-2">
                Track, manage & improve your mental wellness.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} HealthCare+. All rights reserved.</p>
          <div className="space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}