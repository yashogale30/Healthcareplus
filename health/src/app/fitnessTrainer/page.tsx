"use client";

import Navbar from "../../components/navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Split layout */}
      <div className="flex flex-1">
        {/* Planner Section */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-1/2 flex items-center justify-center p-10 
                     bg-gradient-to-br from-blue-400 to-blue-100"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-10 max-w-md text-center border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Planner
            </h1>
            <p className="text-gray-600 mb-6">
              Plan your goals, manage savings, and get a clear roadmap for your
              financial future. Organize your budget effectively.
            </p>
            <Link href="fitnessTrainer/planner">
              <Button
                className="px-6 py-3 text-base font-medium rounded-xl shadow-sm 
                           bg-blue-500 text-white hover:bg-blue-600"
              >
                Go to Planner
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Tracker Section */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          className="w-1/2 flex items-center justify-center p-10 
                     bg-gradient-to-br from-green-100 to-green-400"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-10 max-w-md text-center border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Tracker
            </h1>
            <p className="text-gray-600 mb-6">
              Track your expenses and monitor spending habits with ease.
              Visualize insights to improve savings and spending patterns.
            </p>
            <Link href="fitnessTrainer/tracker">
              <Button
                className="px-6 py-3 text-base font-medium rounded-xl shadow-sm 
                           bg-green-500 text-white hover:bg-green-600"
              >
                Go to Tracker
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}