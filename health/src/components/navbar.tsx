"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Site Name */}
        <Link href="/">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight hover:text-blue-600 transition-colors">
            HealthCare+
          </h1>
        </Link>

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
        <div className="flex items-center space-x-4">
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 hover:cursor-pointer transition"
            >
              Login
            </button>
          ) : (
            <>
              <Link href="/profile" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition">
                Profile
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 hover:cursor-pointer transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Button / Call-to-Action */}
        
      </div>
    </header>
  );
}