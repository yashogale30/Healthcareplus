"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import { useState } from "react";

export default function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-[#C0A9BD]/20 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Site Name */}
        <Link href="/">
          <h1 className="text-3xl font-light text-[#64766A] tracking-tight hover:text-[#C0A9BD] transition-all duration-300">
            HealthCare<span className="text-[#C0A9BD] font-normal">+</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8 text-[#64766A] font-medium">
          <Link
            href="/diseasePrediction"
            className="hover:text-[#C0A9BD] transition-all duration-300 relative group"
          >
            Disease Prediction
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] group-hover:w-full transition-all duration-300"></span>
          </Link>

          <Link
            href="/findClinics"
            className="hover:text-[#C0A9BD] transition-all duration-300 relative group"
          >
            Find Clinics
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] group-hover:w-full transition-all duration-300"></span>
          </Link>
          
          <Link
            href="/calorieTracker"
            className="hover:text-[#C0A9BD] transition-all duration-300 relative group"
          >
            Nutrition Tracker
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/fitnessTrainer"
            className="hover:text-[#C0A9BD] transition-all duration-300 relative group"
          >
            Fitness Studio
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/mentalHealth"
            className="hover:text-[#C0A9BD] transition-all duration-300 relative group"
          >
            Mental Wellness
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C0A9BD] to-[#94A7AE] group-hover:w-full transition-all duration-300"></span>
          </Link>
          
          
        </nav>

        {/* Auth Section */}
        <div className="hidden lg:flex items-center space-x-4">
          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="px-6 py-3 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-full font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <Link 
                href="/profile" 
                className="px-5 py-2.5 bg-white/80 backdrop-blur-sm text-[#64766A] rounded-full font-medium border border-[#C0A9BD]/30 hover:bg-[#C0A9BD]/10 hover:border-[#C0A9BD]/50 transition-all duration-300"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="px-5 py-2.5 bg-gradient-to-r from-[#C0A9BD] to-[#C0A9BD]/90 text-white rounded-full font-medium hover:from-[#C0A9BD]/90 hover:to-[#C0A9BD]/80 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#C0A9BD]/30 text-[#64766A] hover:bg-[#C0A9BD]/10 transition-all duration-300"
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-[#C0A9BD]/20 shadow-lg">
          <nav className="px-6 py-6 space-y-4">
            <Link
              href="/diseasePrediction"
              className="block py-3 px-4 text-[#64766A] font-medium hover:text-[#C0A9BD] hover:bg-[#C0A9BD]/5 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Disease Prediction
            </Link>
            <Link
              href="/calorieTracker"
              className="block py-3 px-4 text-[#64766A] font-medium hover:text-[#C0A9BD] hover:bg-[#C0A9BD]/5 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Nutrition Tracker
            </Link>
            <Link
              href="/fitnessTrainer"
              className="block py-3 px-4 text-[#64766A] font-medium hover:text-[#C0A9BD] hover:bg-[#C0A9BD]/5 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Fitness Studio
            </Link>
            <Link
              href="/findClinics"
              className="block py-3 px-4 text-[#64766A] font-medium hover:text-[#C0A9BD] hover:bg-[#C0A9BD]/5 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Clinics
            </Link>
            <Link
              href="/mentalHealth"
              className="block py-3 px-4 text-[#64766A] font-medium hover:text-[#C0A9BD] hover:bg-[#C0A9BD]/5 rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Mental Wellness
            </Link>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-[#C0A9BD]/20">
              {!user ? (
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-xl font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 shadow-lg"
                >
                  Sign In
                </button>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/profile" 
                    className="block w-full px-6 py-3 bg-white/80 backdrop-blur-sm text-[#64766A] rounded-xl font-medium border border-[#C0A9BD]/30 hover:bg-[#C0A9BD]/10 transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#C0A9BD] to-[#C0A9BD]/90 text-white rounded-xl font-medium hover:from-[#C0A9BD]/90 hover:to-[#C0A9BD]/80 transition-all duration-300 shadow-lg"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
