import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

function Features() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Technology Used",
      content: `
> This loan approval system is developed using modern AI and web technologies to ensure performance, usability, and transparency.

> The backend machine learning model uses Python libraries such as Scikit-learn and Pandas for preprocessing and prediction.

> The frontend interface is built using React, Tailwind CSS, and Framer Motion to provide a responsive and interactive experience.

> The system integrates classification models, structured data handling, and secure processing to deliver reliable loan evaluation results.
`
    },
    {
      title: "Efficient Decision Processing",
      content: `
> The AI model evaluates applicant information instantly compared to manual assessment.

> This improves scalability, minimizes human error, and allows systems to handle large volumes efficiently.
`
    },
    {
      title: "Explainable AI Decisions",
      content: `
> Unlike black-box systems, this model emphasizes transparency.

> Users receive meaningful feedback explaining decision outcomes.
`
    },
    {
      title: "AI Limitations & Human Oversight",
      content: `
> AI enhances speed and consistency but cannot fully replace human judgment.

> Human review remains essential for critical decisions.
`
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6
      }
    })
  };

  return (
    <div className="min-h-screen text-white px-6 md:px-14 py-10">

      {/* Navbar */}
      <div className="flex justify-between items-center min-h-[80px]">



        {/* Logo */}
        <div
  onClick={() => navigate("/")}
  className="flex items-center cursor-pointer shrink-0"
>
  <img
    src={logo}
    alt="LoanAI Logo"
    className="h-[70px] w-auto max-h-none object-contain"
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

          <span className="text-yellow-300">
            Features
          </span>

          <span
            onClick={() => alert("Reports coming soon")}
            className="hover:text-purple-300 cursor-pointer"
          >
            Reports
          </span>

        </div>

        {/* Button */}
        <button className="border px-5 py-2 rounded-full hover:bg-purple-700">
          Signup
        </button>

      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl font-bold">
          Practical System Features
        </h1>

        <p className="mt-4 text-gray-300 text-lg">
          Overview of technologies, efficiency, explainability,
          and responsible AI usage in the loan approval system.
        </p>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 gap-12">

        {sections.map((section, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{
              scale: 1.02,
              y: -6,
              boxShadow: "0px 15px 45px rgba(139,92,246,0.4)"
            }}
            className="
              bg-gradient-to-r
              from-purple-600/70
              to-blue-600/70
              backdrop-blur-md
              border border-purple-300/50
              p-10
              rounded-lg
              min-h-[240px]
              transition-all
            "
          >
            <h2 className="text-2xl font-bold mb-5 text-yellow-300">
              {section.title}
            </h2>

            <p className="text-gray-100 whitespace-pre-line leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}

      </div>

      {/* Footer */}
      <footer className="
        mt-20 py-6 text-center
        border-t border-purple-500/20
        text-purple-200/70
      ">
        © {new Date().getFullYear()} LoanAI
      </footer>

    </div>
  );
}

export default Features;
