import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

function Home() {
  const navigate = useNavigate();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  // Feature data
  const features = [
    {
      icon: "⚡",
      title: "Instant Decisions",
      desc: "Get loan approval results within seconds."
    },
    {
      icon: "🧠",
      title: "Explainable AI",
      desc: "Understand exactly why a decision was made."
    },
    {
      icon: "📈",
      title: "Smart Guidance",
      desc: "Improve eligibility with personalized tips."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-white px-8 py-10">

      {/* Main Content */}
      <div className="flex-grow">

        {/* Navbar */}
        <div className="flex justify-between items-center">

          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center"
          >
            <img
              src={logo}
              alt="LoanAI Logo"
              className="h-10"
            />
          </div>

          {/* Menu */}
          <div className="space-x-8 hidden md:flex">

            <span
              onClick={() => navigate("/")}
              className="hover:text-purple-300 cursor-pointer"
            >
              Home
            </span>

            <span
              onClick={() => navigate("/features")}
              className="hover:text-purple-300 cursor-pointer"
            >
              Features
            </span>

            <span
              onClick={() => alert("Reports page coming soon")}
              className="hover:text-purple-300 cursor-pointer"
            >
              Reports
            </span>

          </div>

          {/* Signup button */}
          <button className="border px-5 py-2 rounded-full hover:bg-purple-700">
            Signup
          </button>

        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mt-20"
        >
          <h1 className="text-6xl font-bold leading-tight">
            Unlock Your Financial Freedom
          </h1>

          <p className="mt-6 text-gray-300 text-lg">
            AI-powered loan approval with instant decisions,
            transparent explanations, and personalized recommendations.
          </p>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/apply")}
            className="
              mt-10 px-10 py-4 rounded-full text-lg font-semibold text-white
              bg-gradient-to-r
              from-purple-800
              to-purple-600
              hover:from-purple-700
              hover:to-purple-500
              transition-all
            "
          >
            Check My Eligibility →
          </motion.button>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-10 mt-24 max-w-7xl mx-auto">

          {features.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.03,
                boxShadow: "0px 15px 40px rgba(99,102,241,0.6)"
              }}
              className="
                bg-gradient-to-r
                from-purple-500/70
                to-blue-500/70
                border border-purple-300/70
                backdrop-blur-md
                p-10 rounded-xl cursor-pointer
                transition-all
                min-h-[160px]
              "
            >
              <h3 className="text-xl font-semibold">
                {item.icon} {item.title}
              </h3>

              <p className="text-gray-100 mt-3 text-base">
                {item.desc}
              </p>
            </motion.div>
          ))}

        </div>

      </div>

      {/* Footer */}
      <footer className="
        py-6 text-center
        border-t border-purple-500/20
        text-purple-200/70
      ">
        © {new Date().getFullYear()} LoanAI. All rights reserved.
      </footer>

    </div>
  );
}

export default Home;
