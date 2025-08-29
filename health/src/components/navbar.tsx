"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Site Name */}
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight hover:text-blue-600 transition-colors"  onClick={() => router.push("/")}>
          HealthCare+
        </h1>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link
            href="/diseasePrediction"
            className="hover:text-blue-600 transition-colors"
          >
            Disease Prediction
          </Link>
          <Link
            href="/calorieTracker"
            className="hover:text-blue-600 transition-colors"
          >
            Nutrition Value
          </Link>
          <Link
            href="/fitnessTrainer"
            className="hover:text-blue-600 transition-colors"
          >
            AI Fitness
          </Link>
          <Link
            href="/findClinics"
            className="hover:text-blue-600 transition-colors"
          >
            Find Clinics
          </Link>
          <Link
            href="/mentalHealth"
            className="hover:text-blue-600 transition-colors"
          >
            Mental State
          </Link>
          <Link
            href="/more"
            className="hover:text-blue-600 transition-colors"
          >
            More
          </Link>
        </nav>

        {/* Button / Call-to-Action */}
        
      </div>
    </header>
  );
}